---
title: System Behavior During Poor Network Connectivity
audience: public
version: 1
last_reviewed: 2026-11-05
---

# System Behavior During Poor Network Connectivity

## What the Web Application Displays
If your mobile phone or laptop experiences spotty Wi-Fi or cellular connectivity while navigating the laundry portal:
- The web app displays a subtle network banner: "Reconnecting to live laundry updates...".
- Machine states and slot statuses will cache the most recently confirmed state until a stable connection is re-established.
- Real-time changes queue and synchronize as soon as Socket.IO reconnects.

## What Happens to a Paid Booking?
Your reservation state is securely managed by the server and PostgreSQL database, completely independent of your client device's internet connection:
- If you have successfully paid and received order confirmation, your slot remains guaranteed.
- The machine's physical current sensors and IoT telemetry communicate directly with the campus broker over dedicated infrastructure, regardless of your personal device status.
- Once your cycle finishes, your in-app notification is queued and appears the moment you reopen the web application.

## Automatic Refund Protection
If poor mobile connectivity interrupts your checkout:
- If payment did not go through, the 5-minute hold simply expires safely without charging your account.
- If payment was deducted by your bank but your phone dropped connection before the browser confirmed the order, our backend Razorpay webhook handler safely captures the event. If the booking had already expired or conflicted, our automated payment reconciler triggers an immediate full refund to your account.
- If your machine fails to start within the 5-minute grace period after slot start, an automatic full refund is processed server-side even if your phone is completely offline.
