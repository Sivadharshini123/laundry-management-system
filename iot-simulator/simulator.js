import mqtt from 'mqtt';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const MQTT_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const HTTP_PORT = parseInt(process.env.SIMULATOR_PORT || '5001', 10);

const app = express();
app.use(cors());
app.use(express.json());

// Virtual Device definition
class VirtualMachine {
  constructor(id, laundryId, label, type, mqttClient) {
    this.id = id;
    this.laundryId = laundryId;
    this.label = label;
    this.type = type;
    this.mqtt = mqttClient;

    this.state = 'idle'; // 'idle' | 'running' | 'done' | 'offline'
    this.amps = 0.03;
    this.heartbeatDropped = false;
    this.heartbeatInterval = null;
    this.cycleTimeout = null;
    this.collectionTimeout = null;
  }

  get stateTopic() {
    return `laundry/${this.laundryId}/machine/${this.id}/state`;
  }

  get heartbeatTopic() {
    return `laundry/${this.laundryId}/machine/${this.id}/heartbeat`;
  }

  start() {
    // Publish initial state
    this.publishState();

    // Heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      this.publishHeartbeat();
    }, 30000);

    // Initial heartbeat
    this.publishHeartbeat();
  }

  publishHeartbeat() {
    if (this.heartbeatDropped || this.state === 'offline') {
      return; // Simulate dropped telemetry
    }
    const payload = JSON.stringify({
      ts: Math.floor(Date.now() / 1000),
      fw: 'sim-1.0'
    });
    this.mqtt.publish(this.heartbeatTopic, payload);
  }

  publishState() {
    const payload = JSON.stringify({
      state: this.state,
      amps: Number(this.amps.toFixed(2)),
      ts: Math.floor(Date.now() / 1000)
    });
    this.mqtt.publish(this.stateTopic, payload);
    console.log(`[Simulator] Machine #${this.id} (${this.label}) -> State: ${this.state}, Amps: ${this.amps.toFixed(2)}A`);
  }

  startCycle(durationMinutes = null) {
    if (this.cycleTimeout) clearTimeout(this.cycleTimeout);
    if (this.collectionTimeout) clearTimeout(this.collectionTimeout);

    // Duration: 35 to 50 minutes randomized, or custom
    const duration = durationMinutes ? durationMinutes * 60 * 1000 : (35 + Math.floor(Math.random() * 15)) * 60 * 1000;
    
    this.state = 'running';
    // Current while running: 0.80 to 1.20 amps
    this.amps = 0.85 + Math.random() * 0.30;
    this.publishState();

    // Schedule transition to done
    this.cycleTimeout = setTimeout(() => {
      this.finishCycle();
    }, duration);
  }

  finishCycle() {
    if (this.cycleTimeout) clearTimeout(this.cycleTimeout);

    this.state = 'done';
    this.amps = 0.03;
    this.publishState();

    // Auto-collection after random delay (e.g. 5 to 15 min in real life; or 1 min in demo)
    this.collectionTimeout = setTimeout(() => {
      this.resetToIdle();
    }, 10 * 60 * 1000);
  }

  resetToIdle() {
    if (this.collectionTimeout) clearTimeout(this.collectionTimeout);
    this.state = 'idle';
    this.amps = 0.03;
    this.publishState();
  }

  failStart() {
    // Simulates machine not starting despite a booking (amps stay idle)
    console.log(`[Simulator] Machine #${this.id} simulated startup failure.`);
    this.state = 'idle';
    this.amps = 0.03;
    this.publishState();
  }

  goOffline(minutes = 3) {
    this.heartbeatDropped = true;
    this.state = 'offline';
    this.amps = 0.0;
    this.publishState();
    console.log(`[Simulator] Machine #${this.id} gone offline for ${minutes} minutes.`);

    setTimeout(() => {
      this.goOnline();
    }, minutes * 60 * 1000);
  }

  goOnline() {
    this.heartbeatDropped = false;
    this.state = 'idle';
    this.amps = 0.03;
    this.publishHeartbeat();
    this.publishState();
    console.log(`[Simulator] Machine #${this.id} back online.`);
  }

  runUnassigned() {
    console.log(`[Simulator] Machine #${this.id} starting unassigned run (no booking).`);
    this.startCycle(20);
  }

  getInfo() {
    return {
      id: this.id,
      laundryId: this.laundryId,
      label: this.label,
      type: this.type,
      state: this.state,
      amps: Number(this.amps.toFixed(2)),
      heartbeatDropped: this.heartbeatDropped
    };
  }
}

// Initialize 14 Machines
const machines = [];
const mqttClient = mqtt.connect(MQTT_URL, {
  clientId: 'iot_simulator_master',
  reconnectPeriod: 3000
});

mqttClient.on('connect', () => {
  console.log(`[Simulator] Connected to Mosquitto broker at ${MQTT_URL}`);
  
  if (machines.length === 0) {
    // 7 machines for Laundry A (IDs 1..7)
    for (let i = 1; i <= 7; i++) {
      const type = i <= 4 ? 'washer' : 'dryer';
      const label = `Laundry A – ${type === 'washer' ? 'Washer' : 'Dryer'} ${i <= 4 ? i : i - 4}`;
      const vm = new VirtualMachine(i, 1, label, type, mqttClient);
      machines.push(vm);
      vm.start();
    }

    // 7 machines for Laundry B (IDs 8..14)
    for (let i = 8; i <= 14; i++) {
      const num = i - 7;
      const type = num <= 4 ? 'washer' : 'dryer';
      const label = `Laundry B – ${type === 'washer' ? 'Washer' : 'Dryer'} ${num <= 4 ? num : num - 4}`;
      const vm = new VirtualMachine(i, 2, label, type, mqttClient);
      machines.push(vm);
      vm.start();
    }

    console.log(`[Simulator] Initialized and launched 14 virtual machines.`);
  }
});

mqttClient.on('error', (err) => {
  console.warn('[Simulator] MQTT connection error:', err.message);
});

// Control HTTP API
app.get('/api/control/status', (req, res) => {
  res.json({ machines: machines.map(m => m.getInfo()) });
});

app.post('/api/control/trigger-cycle', (req, res) => {
  const { machineId, durationMinutes } = req.body;
  const m = machines.find(x => x.id === parseInt(machineId, 10));
  if (!m) return res.status(404).json({ error: 'Machine not found' });

  m.startCycle(durationMinutes ? parseFloat(durationMinutes) : null);
  res.json({ message: `Cycle started for Machine #${m.id}`, machine: m.getInfo() });
});

app.post('/api/control/finish-cycle', (req, res) => {
  const { machineId } = req.body;
  const m = machines.find(x => x.id === parseInt(machineId, 10));
  if (!m) return res.status(404).json({ error: 'Machine not found' });

  m.finishCycle();
  res.json({ message: `Cycle finished for Machine #${m.id}`, machine: m.getInfo() });
});

app.post('/api/control/clear-clothes', (req, res) => {
  const { machineId } = req.body;
  const m = machines.find(x => x.id === parseInt(machineId, 10));
  if (!m) return res.status(404).json({ error: 'Machine not found' });

  m.resetToIdle();
  res.json({ message: `Clothes collected. Machine #${m.id} reset to idle`, machine: m.getInfo() });
});

app.post('/api/control/fail-start', (req, res) => {
  const { machineId } = req.body;
  const m = machines.find(x => x.id === parseInt(machineId, 10));
  if (!m) return res.status(404).json({ error: 'Machine not found' });

  m.failStart();
  res.json({ message: `Triggered startup failure for Machine #${m.id}`, machine: m.getInfo() });
});

app.post('/api/control/go-offline', (req, res) => {
  const { machineId, durationMinutes } = req.body;
  const m = machines.find(x => x.id === parseInt(machineId, 10));
  if (!m) return res.status(404).json({ error: 'Machine not found' });

  m.goOffline(durationMinutes ? parseFloat(durationMinutes) : 3);
  res.json({ message: `Machine #${m.id} moved offline`, machine: m.getInfo() });
});

app.post('/api/control/go-online', (req, res) => {
  const { machineId } = req.body;
  const m = machines.find(x => x.id === parseInt(machineId, 10));
  if (!m) return res.status(404).json({ error: 'Machine not found' });

  m.goOnline();
  res.json({ message: `Machine #${m.id} restored online`, machine: m.getInfo() });
});

app.post('/api/control/unassigned-run', (req, res) => {
  const { machineId } = req.body;
  const m = machines.find(x => x.id === parseInt(machineId, 10));
  if (!m) return res.status(404).json({ error: 'Machine not found' });

  m.runUnassigned();
  res.json({ message: `Machine #${m.id} triggered unassigned run`, machine: m.getInfo() });
});

app.listen(HTTP_PORT, () => {
  console.log(`IoT Simulator Control API running on http://localhost:${HTTP_PORT}`);
});
