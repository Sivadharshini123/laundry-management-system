---
title: Staff Refund and Reconciliation Operations
audience: staff
version: 1
last_reviewed: 2026-11-05
---

# Staff Refund and Reconciliation Operations

## Overview
Campus laundry refunds are automated through Razorpay webhooks and backend grace period monitoring. Staff do not manually approve individual student cancellations or hardware startup failures, as these are processed autonomously to ensure an equitable student experience.

## Monitoring Failed Bookings and Automatic Refunds
From the Staff Dashboard, navigate to the **Failed Bookings & Refunds** view:
1. **Startup Failure Audits**:
   - Filter by reason code `MACHINE_NOT_STARTED`.
   - Verify that the machine failed to draw operating current (>0.50A) within 5 minutes of slot start.
   - Confirm that the `refunds` table shows `status = 'processed'` and contains the valid `razorpay_refund_id`.
2. **Reconciliation Mismatches**:
   - If Razorpay captures a payment without a corresponding active booking (`PAYMENT_WITHOUT_BOOKING`), review the webhook transaction log.
   - The reconciliation worker immediately issues a full refund and notes the orphaned payment ID.
3. **Audit Trail Compliance**:
   - Every refund record in PostgreSQL links `booking_id`, `payment_id`, `amount_paise`, and an immutable timestamp.
   - Any manual intervention must be logged via the Staff Dashboard with an explicit reason entry stored in `audit_log`.

## Handling Uncollected Clothes
When a machine remains in `done` state for greater than 20 minutes without drum emptying:
1. The dashboard highlights the machine under **Uncollected Clothes Alerts**.
2. Staff can trigger an in-app reminder push notification directly to the student.
3. If necessary for subsequent reservations, staff may bag the clothes into labeled campus storage bags, record the action in the audit log, and mark the machine drum cleared.
