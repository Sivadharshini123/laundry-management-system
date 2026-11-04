---
title: Machine Status Meanings
audience: public
version: 1
last_reviewed: 2026-11-05
---

# Machine Status Meanings

The campus laundry dashboard provides real-time visibility into every machine's operating status. Below is a guide to what each indicator represents:

## 1. Available
- **Meaning**: The machine is operational, idle, has published a fresh heartbeat within the last 90 seconds, and has no active booking or pending hold covering the current time slot.
- **Action for Student**: You can immediately reserve this slot and proceed to payment.

## 2. In Use (Running)
- **Meaning**: The machine is currently running an active wash or dry cycle. Current sensors detect operational power draw (amps >= 0.50A).
- **Display**: The application calculates and displays an estimated minutes remaining until completion based on historical cycle telemetry (defaulting to 45 minutes).
- **Action for Student**: The machine is occupied. You may browse other machines or book an upcoming future slot.

## 3. Finished (Waiting to be Collected)
- **Meaning**: The washing or drying cycle has finished, and clothes are awaiting pickup by the student.
- **Action for Student**: If this was your booking, please collect your laundry immediately. If you have the subsequent booking, allow a brief grace period for collection.

## 4. Reserved
- **Meaning**: Another student is actively within their 5-minute checkout window.
- **Action for Student**: If the other student completes payment, the slot becomes Booked. If they fail to pay before the 5 minutes expire, the slot automatically re-opens as Available.

## 5. Booked
- **Meaning**: A student has successfully paid for this slot.

## 6. Status Unknown (Offline / Stale Heartbeat)
- **Meaning**: The machine's IoT telemetry sensor has not published a heartbeat for over 90 seconds, or the sensor reported an offline state.
- **Safety Rule**: The system **never** displays a machine with a stale heartbeat as Available, even if no booking is scheduled.
- **Action for Student**: Maintenance staff are automatically alerted to inspect connectivity or power supply. Please choose an alternative machine.
