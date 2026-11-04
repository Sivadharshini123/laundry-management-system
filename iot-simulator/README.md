# Virtual IoT Simulator for Campus Laundry Machines

The simulator runs 14 virtual IoT nodes corresponding to the 14 campus washing machines and dryers across Laundry A and Laundry B. It reproduces the exact MQTT topic structure and JSON telemetry that will be emitted by physical ESP32 current-sensor microcontrollers.

## MQTT Architecture

### Topics
1. **State Transition Messages**:
   - Topic: `laundry/{laundryId}/machine/{machineId}/state`
   - Published: Whenever the machine switches states (`idle`, `running`, `done`, `offline`).
   - Payload:
     ```json
     {
       "state": "running",
       "amps": 0.94,
       "ts": 1730700000
     }
     ```
2. **Heartbeat Watchdog Messages**:
   - Topic: `laundry/{laundryId}/machine/{machineId}/heartbeat`
   - Published: Every 30 seconds.
   - Payload:
     ```json
     {
       "ts": 1730700000,
       "fw": "sim-1.0"
     }
     ```

## State Model and Electrical Current (Amperes)
- `idle`: Standby power draw of ~0.02A to 0.05A.
- `running`: Active motor and heating element draw of ~0.80A to 1.20A (threshold configured at 0.50A).
- `done`: Cycle complete, waiting for drum collection (~0.03A).
- `offline`: Sensor disconnected or power cut.

## HTTP Control Endpoints (Port 5001)

Developers can trigger edge-case scenarios on demand:
- **Get All Simulated Machine States**:
  `GET http://localhost:5001/api/control/status`
- **Trigger Machine Cycle (Start Running)**:
  `POST http://localhost:5001/api/control/trigger-cycle`
  Body: `{"machineId": 1, "durationMinutes": 40}`
- **Fast-Forward Cycle Finish (Done)**:
  `POST http://localhost:5001/api/control/finish-cycle`
  Body: `{"machineId": 1}`
- **Clear Collected Clothes (Return to Idle)**:
  `POST http://localhost:5001/api/control/clear-clothes`
  Body: `{"machineId": 1}`
- **Simulate Start Failure (Grace Period Test)**:
  `POST http://localhost:5001/api/control/fail-start`
  Body: `{"machineId": 5}`
- **Simulate Dropped Heartbeat (Status Unknown Test)**:
  `POST http://localhost:5001/api/control/go-offline`
  Body: `{"machineId": 2, "durationMinutes": 3}`
- **Simulate Unassigned Running Machine (Staff Alert Test)**:
  `POST http://localhost:5001/api/control/unassigned-run`
  Body: `{"machineId": 3}`

## Replacing the Simulator with Physical ESP32 Hardware

The backend ingestion layer (`server/src/services/ingestion.js`) was specifically designed with zero dependencies on the simulator. When physical ESP32 boards equipped with non-invasive SCT-013 AC current transformers are deployed:

1. Flash the ESP32 with standard Arduino or ESP-IDF firmware.
2. Configure the ESP32 to connect to the campus Wi-Fi and the Mosquitto MQTT broker (`1883`).
3. Set the client ID to `esp32_laundry_{laundryId}_machine_{machineId}`.
4. Read root-mean-square current (amps) from the ADC.
5. Publish every 30 seconds to:
   `laundry/<laundryId>/machine/<machineId>/heartbeat`
6. Publish on state threshold crossing (>0.50A = running, drop to <0.10A = done) to:
   `laundry/<laundryId>/machine/<machineId>/state`
7. **No changes to backend code, database schema, or client application are required.**
