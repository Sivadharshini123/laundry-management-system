---
title: Privacy and Student Data Policy
audience: public
version: 1
last_reviewed: 2026-11-05
---

# Privacy and Student Data Policy

## What Data We Collect and Store
The college laundry booking platform only collects the minimal information required to manage machine reservations, transactions, and hardware safety:
- **Student Profile**: Full name, college email address, and a securely salted password hash (bcrypt). We do not store plain-text passwords.
- **Booking Records**: Machine reserved, slot start and end timestamps, price in paise, and booking status history.
- **Payment & Refund Identifiers**: Razorpay order IDs, payment IDs, and refund IDs for accounting reconciliation. We never store credit card numbers, CVVs, or bank account credentials.
- **In-App Notifications**: Delivery status of cycle completion reminders and slot offer notifications.
- **Audit Logs & Chat Logs**: Records of system interactions. Chat turns store user text, assistant response, and tools invoked.

## Strict AI Assistant Privacy Safeguards
When you interact with the campus AI chat assistant:
- **No Personal Fields**: The AI assistant model is never sent your name, college email address, phone number, or payment card details.
- **Server-Side Enforcement**: Privacy filtering is strictly implemented in application backend code, not merely in system prompt instructions.
- **Strict Student Isolation**: The assistant can only query bookings and transactions belonging to your authenticated login session. It is architecturally impossible for one student's chat assistant to retrieve or view another student's booking details.

## Data Retention Periods
- Active booking records: Retained for [TO CONFIRM BY COLLEGE].
- Financial transaction and refund audit records: Retained for [TO CONFIRM BY COLLEGE].
- Chat interaction logs: Retained for [TO CONFIRM BY COLLEGE].
- Student profile data: Maintained as long as the student maintains an active enrollment status with the college.
