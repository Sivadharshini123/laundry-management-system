---
title: How Campus Laundry Machines Work
audience: public
version: 1
last_reviewed: 2026-11-05
---

# How Campus Laundry Machines Work

## Machine Types and Allocations
The campus laundry service operates 14 heavy-duty commercial machines distributed evenly across two facility hubs:
- **Laundry A (North Campus Residence)**: 7 machines (Washers and Dryers)
- **Laundry B (South Campus Residence)**: 7 machines (Washers and Dryers)

Each machine is assigned a distinct identifier (e.g., "Laundry A – Washer 1", "Laundry B – Dryer 2").

## Cycle Lengths and Slot Timing
- **Standard Slot Duration**: Each reserved slot is allocated for 45 minutes by default.
- **Typical Cycle Duration**: Depending on load size and cycle selection (delicate, heavy, rapid), an active cycle typically runs between 35 and 50 minutes.
- **Current Sensor Monitoring**: Every machine is monitored via IoT current sensors measuring real-time electrical draw in amperes.
  - Idle machine: Draws approximately 0.02 to 0.05 amps.
  - Running cycle: Draws between 0.80 and 1.20 amps (threshold configured at 0.50 amps).
  - Cycle completion: Current drops below the threshold for more than 60 seconds.

## Loading and Collecting Your Clothes
1. **Arrival**: Arrive at the laundry 2 to 3 minutes before your slot start time.
2. **Loading**: Check that the drum is empty. Load clothes and detergent, select the cycle, and press start.
3. **Automated Tracking**: The web application senses current draw and automatically updates your booking status to **Running** (`running`).
4. **Collection Prompt**: When the cycle concludes, current draw drops to idle, the machine transitions to **Finished** (`done`), and you immediately receive an in-app notification: "Clothes ready for collection".
5. **Prompt Collection**: Please collect your belongings promptly within 10 minutes of cycle completion so fellow students can start their booked slots on time.
