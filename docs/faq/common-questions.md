---
title: Frequently Asked Questions
audience: public
version: 1
last_reviewed: 2026-11-05
---

# Frequently Asked Questions

### 1. How do I book a laundry machine?
Log into your campus account, select either Laundry A or Laundry B, choose a washer or dryer with an Available slot, and click "Reserve". You will have 5 minutes to complete checkout via Razorpay.

### 2. How long do I have to pay after reserving?
You have exactly 5 minutes. A live countdown timer is shown on the checkout screen. If payment is not completed within 5 minutes, the reservation expires and releases the slot.

### 3. Can I cancel my booking if my plans change?
Yes. You can cancel any booking before its scheduled start time from your dashboard. A 100% full refund is issued automatically and instantly.

### 4. Are there any fees or penalties for cancellation?
No. Cancellations are 100% free of charge. You always receive a full refund with zero deductions.

### 5. What happens if the machine does not start?
Every booking includes a 5-minute grace period from the slot start time. If the machine's current sensor does not detect an active cycle within those 5 minutes, the booking is automatically marked Failed, and a full refund is issued immediately.

### 6. How do I know when my laundry is finished?
The IoT sensor detects when motor current drops back to idle levels. An in-app notification ("Clothes ready for collection") is instantly delivered to your account and shown in the notification bell.

### 7. What happens if someone leaves clothes in the machine?
When a machine status shows "Finished", the previous user has been sent a collection notification. If clothes remain uncollected for over 15 minutes, please notify campus laundry staff who will assist in safely clearing the machine.

### 8. What is the waiting list and how does it work?
If a slot you want is booked or reserved, you can join the waiting list. If the slot is cancelled or the payment hold expires, the system immediately offers the slot to the first student on the list. You will receive an in-app offer valid for 3 minutes to pay and claim the slot.

### 9. What does "Status Unknown" mean?
"Status Unknown" indicates that the machine's IoT hardware sensor has missed its regular 30-second heartbeat check-in for more than 90 seconds. To prevent scheduling conflicts or machine breakdowns, the system never allows booking a machine in this state.

### 10. Can I book more than one machine at the same time?
Yes, you may book a washer and a dryer across consecutive or parallel slots, provided the respective slots are available.

### 11. How are prices determined?
Prices are configured per machine by campus facilities (stored in paise) and visible on each machine card. Prices are always verified server-side.

### 12. Which payment methods are accepted?
Our Razorpay integration accepts UPI (Google Pay, PhonePe, Paytm), Debit Cards, Credit Cards, and Net Banking.

### 13. How long does a refund take to reach my bank?
While our system executes refunds instantly, bank processing times vary: UPI refunds typically appear within 1–2 hours, while debit and credit cards usually take 3–5 business days depending on your bank.

### 14. What if my payment was deducted but my booking expired?
Our backend webhook automatically reconciles unattached payments. If money was captured without a valid booking, the system issues an automatic full refund and notifies you immediately.

### 15. Where are the laundry rooms located?
Laundry A is located on the ground floor of the North Campus Residence Hall. Laundry B is located in the South Campus Commons adjacent to the student center.

### 16. What are the laundry operating hours?
Both laundries are accessible from 06:00 AM to 11:00 PM daily. Machine slots reflect facility operating hours.

### 17. How does the AI chat assistant help me?
The AI assistant can check your recent bookings, explain transaction and refund statuses, summarize policies, and provide fabric care advice. It strictly protects your privacy and never has access to other students' data.

### 18. Can the AI assistant manually issue or modify my refund?
No. The assistant cannot approve, alter, or promise refunds. All refunds are automated by the core booking engine according to our transparent policy rules.
