---
title: Machine Maintenance and Hardware Troubleshooting
audience: staff
version: 1
last_reviewed: 2026-11-05
---

# Machine Maintenance and Hardware Troubleshooting

## Marking a Machine Out of Service
When a machine requires physical inspection, repairs, or deep descaling:
1. Open the Staff Dashboard and locate the specific machine card.
2. Toggle the **Out of Service** switch to `true`.
3. Provide a brief reason (e.g., "Drum bearing noise", "Water inlet valve inspection").
4. **Impact on System**:
   - The machine immediately becomes unavailable for future reservations.
   - Any currently pending holds are cancelled.
   - Any confirmed future paid bookings that have not yet run are automatically cancelled and refunded in full with reason `MACHINE_OUT_OF_SERVICE`.
   - The action and reason are permanently recorded in `audit_log`.

## Diagnosing "Status Unknown" (Stale Heartbeat)
When a machine shows **Status Unknown**:
1. Check the `last_seen` timestamp on the staff console. If `NOW() - last_seen > 90 seconds`, the IoT heartbeat watchdog has triggered.
2. Verify physical power to the laundry room sub-panel and the machine's wall outlet.
3. Inspect the ESP32 micro-controller status LED:
   - Steady Blue: Wi-Fi connected, MQTT broker pinging.
   - Flashing Red: Wi-Fi disconnected or DHCP failure.
   - Off: Power supply failure to the 5V transformer.
4. Verify Mosquitto broker health (`docker-compose logs mosquitto` or broker port 1883).
5. Once telemetry resumes, `machine_state.last_seen` updates automatically and the machine status returns to normal without requiring manual server restart.

## Investigating Unassigned Running Machines
If an IoT telemetry message reports `running` (current > 0.50A) but no paid booking exists for the current time slot:
- An immediate high-priority alert is raised on the Staff Dashboard: "Unassigned running machine detected".
- Staff should physically verify if a student started a cycle without booking or if a maintenance technician is running a test wash.
