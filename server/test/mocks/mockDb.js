// In-memory test store and query evaluator for testing server business rules
// accurately handles EXCLUDE constraint (23P01), transactions, hold expiry, and idempotency

export class MockDatabase {
  constructor() {
    this.reset();
  }

  reset() {
    this.students = [
      { id: 1, name: 'Campus Facilities Staff', college_email: 'staff@college.edu', role: 'staff' },
      { id: 2, name: 'Aarav Sharma', college_email: 'student1@college.edu', role: 'student' },
      { id: 3, name: 'Diya Patel', college_email: 'student2@college.edu', role: 'student' },
      { id: 4, name: 'Rohan Verma', college_email: 'student3@college.edu', role: 'student' }
    ];

    this.laundries = [
      { id: 1, name: 'Laundry A (North Residence)', address: 'North Hall Room 102', opening_hours: '06:00 - 23:00', active: true },
      { id: 2, name: 'Laundry B (South Commons)', address: 'South Commons B-14', opening_hours: '06:00 - 23:00', active: true }
    ];

    this.machines = [];
    this.machine_state = {};
    for (let i = 1; i <= 14; i++) {
      const laundryId = i <= 7 ? 1 : 2;
      const type = (i % 7 <= 4 && i % 7 !== 0) ? 'washer' : 'dryer';
      this.machines.push({
        id: i,
        laundry_id: laundryId,
        label: `Laundry ${laundryId === 1 ? 'A' : 'B'} – ${type === 'washer' ? 'Washer' : 'Dryer'} ${i}`,
        type,
        price_paise: type === 'washer' ? 6000 : 4000,
        slot_minutes: 45,
        active: true,
        out_of_service: false,
        run_threshold_amps: 0.50
      });

      this.machine_state[i] = {
        machine_id: i,
        state: 'idle',
        last_seen: new Date(),
        updated_at: new Date()
      };
    }

    this.bookings = [];
    this.payments = [];
    this.refunds = [];
    this.machine_events = [];
    this.waiting_list = [];
    this.notifications = [];
    this.audit_log = [];
    this.chat_messages = [];
    this.knowledge_chunks = [];

    this.bookingSeq = 100;
    this.paymentSeq = 100;
    this.refundSeq = 100;
    this.notificationSeq = 100;
  }

  async query(text, params = []) {
    const trimmed = text.trim();

    // 1. SELECT * FROM machines WHERE id = $1
    if (trimmed.includes('FROM machines') && trimmed.includes('WHERE m.id = $1')) {
      const mId = params[0];
      const m = this.machines.find(x => x.id === mId);
      if (!m) return { rows: [] };
      const s = this.machine_state[mId] || { state: 'idle', last_seen: new Date() };
      return { rows: [{ ...m, current_state: s.state, state: s.state, last_seen: s.last_seen }] };
    }

    // 2. INSERT INTO bookings (with overlap EXCLUDE check)
    if (trimmed.startsWith('INSERT INTO bookings')) {
      const [studentId, machineId, slotStart, slotEnd, holdExpiresAt, amountPaise, status] = params;
      const sStart = new Date(slotStart).getTime();
      const sEnd = new Date(slotEnd).getTime();

      // Check PostgreSQL EXCLUDE constraint: (machine_id WITH =, tstzrange(slot_start, slot_end) WITH &&)
      // for status in ('pending_payment', 'paid', 'running')
      const overlap = this.bookings.find(b => {
        if (b.machine_id !== machineId) return false;
        if (!['pending_payment', 'paid', 'running'].includes(b.status)) return false;
        const bStart = new Date(b.slot_start).getTime();
        const bEnd = new Date(b.slot_end).getTime();
        return sStart < bEnd && sEnd > bStart;
      });

      if (overlap) {
        const err = new Error('conflicting key value violates exclusion constraint "exclude_overlapping_slots"');
        err.code = '23P01'; // PostgreSQL SQLSTATE 23P01
        throw err;
      }

      const booking = {
        id: ++this.bookingSeq,
        student_id: studentId,
        machine_id: machineId,
        slot_start: new Date(slotStart),
        slot_end: new Date(slotEnd),
        hold_expires_at: new Date(holdExpiresAt),
        amount_paise: amountPaise,
        status: status || 'pending_payment',
        razorpay_order_id: null,
        razorpay_payment_id: null,
        razorpay_refund_id: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.bookings.push(booking);
      return { rows: [booking] };
    }

    // 3. UPDATE bookings SET razorpay_order_id = $1
    if (trimmed.startsWith('UPDATE bookings') && trimmed.includes('SET razorpay_order_id = $1')) {
      const [orderId, bookingId] = params;
      const b = this.bookings.find(x => x.id === bookingId);
      if (b) {
        b.razorpay_order_id = orderId;
        b.updated_at = new Date();
        return { rows: [b] };
      }
      return { rows: [] };
    }

    // 4. SELECT for hold cleanup: b.status = 'pending_payment' AND b.hold_expires_at <= NOW()
    if (trimmed.includes("b.status = 'pending_payment' AND b.hold_expires_at <= NOW()")) {
      const now = Date.now();
      const expired = this.bookings.filter(b => 
        b.status === 'pending_payment' && new Date(b.hold_expires_at).getTime() <= now
      ).map(b => ({
        id: b.id,
        student_id: b.student_id,
        machine_id: b.machine_id,
        slot_start: b.slot_start,
        laundry_id: b.machine_id <= 7 ? 1 : 2
      }));
      return { rows: expired };
    }

    // 5. UPDATE bookings SET status = 'expired'
    if (trimmed.startsWith('UPDATE bookings') && trimmed.includes("SET status = 'expired'")) {
      const [id] = params;
      const b = this.bookings.find(x => x.id === id && x.status === 'pending_payment');
      if (b) {
        b.status = 'expired';
        b.updated_at = new Date();
      }
      return { rows: b ? [b] : [] };
    }

    // 6. SELECT b.*, m.laundry_id FROM bookings b WHERE b.razorpay_order_id = $1
    if (trimmed.includes('WHERE b.razorpay_order_id = $1')) {
      const [orderId] = params;
      const b = this.bookings.find(x => x.razorpay_order_id === orderId);
      if (b) {
        return { rows: [{ ...b, laundry_id: b.machine_id <= 7 ? 1 : 2 }] };
      }
      return { rows: [] };
    }

    // 7. Idempotent UPDATE bookings SET status = 'paid', razorpay_payment_id = $1 WHERE id = $2 AND status = 'pending_payment'
    if (trimmed.startsWith('UPDATE bookings') && trimmed.includes("status = 'pending_payment'") && trimmed.includes("SET status = 'paid'")) {
      const [paymentId, bookingId] = params;
      const b = this.bookings.find(x => x.id === bookingId && x.status === 'pending_payment');
      if (b) {
        b.status = 'paid';
        b.razorpay_payment_id = paymentId;
        b.updated_at = new Date();
        return { rows: [b] };
      }
      return { rows: [] }; // Idempotent: 0 rows returned if already paid
    }

    // 8. INSERT INTO payments
    if (trimmed.startsWith('INSERT INTO payments')) {
      const p = {
        id: ++this.paymentSeq,
        booking_id: params[0],
        razorpay_order_id: params[1],
        razorpay_payment_id: params[2],
        amount_paise: params[3],
        status: params[4],
        raw_webhook_id: params[5],
        created_at: new Date()
      };
      this.payments.push(p);
      return { rows: [p] };
    }

    // 9. INSERT INTO refunds
    if (trimmed.startsWith('INSERT INTO refunds')) {
      const r = {
        id: ++this.refundSeq,
        booking_id: params[0],
        payment_id: params[1],
        amount_paise: params[2],
        reason_code: params[3],
        razorpay_refund_id: params[4],
        status: params[5] || 'processed',
        created_at: new Date()
      };
      this.refunds.push(r);
      return { rows: [r] };
    }

    // 10. UPDATE bookings SET status = 'cancelled'
    if (trimmed.startsWith('UPDATE bookings') && trimmed.includes("SET status = 'cancelled'")) {
      const [refundId, bookingId] = params;
      const b = this.bookings.find(x => x.id === bookingId);
      if (b) {
        b.status = 'cancelled';
        b.razorpay_refund_id = refundId;
        b.updated_at = new Date();
        return { rows: [b] };
      }
      return { rows: [] };
    }

    // 11. UPDATE bookings SET status = 'failed'
    if (trimmed.startsWith('UPDATE bookings') && trimmed.includes("SET status = 'failed'")) {
      const [refundId, bookingId] = params;
      const b = this.bookings.find(x => x.id === bookingId);
      if (b) {
        b.status = 'failed';
        b.razorpay_refund_id = refundId;
        b.updated_at = new Date();
        return { rows: [b] };
      }
      return { rows: [] };
    }

    // 12. Student cancellation lookup
    if (trimmed.includes('FROM bookings b') && trimmed.includes('WHERE b.id = $1 AND b.student_id = $2')) {
      const [bId, sId] = params;
      const b = this.bookings.find(x => x.id === bId && x.student_id === sId);
      if (b) {
        const p = this.payments.find(x => x.booking_id === b.id);
        return {
          rows: [{
            ...b,
            laundry_id: b.machine_id <= 7 ? 1 : 2,
            payment_id: p?.id || null,
            razorpay_payment_id: b.razorpay_payment_id || p?.razorpay_payment_id || null
          }]
        };
      }
      return { rows: [] };
    }

    // 13. Grace period check query: slot_start + INTERVAL '5 minutes' < NOW()
    if (trimmed.includes("status = 'paid'") && trimmed.includes("slot_start + INTERVAL '5 minutes' < NOW()")) {
      const now = Date.now();
      const failed = this.bookings.filter(b =>
        b.status === 'paid' && (new Date(b.slot_start).getTime() + 5 * 60 * 1000 < now)
      );
      return { rows: failed.map(b => ({ id: b.id })) };
    }

    // 14. Look up paid booking for failAndRefundBooking
    if (trimmed.includes('FROM bookings b') && trimmed.includes("b.status = 'paid'")) {
      const [bId] = params;
      const b = this.bookings.find(x => x.id === bId && x.status === 'paid');
      if (b) {
        const p = this.payments.find(x => x.booking_id === b.id);
        return {
          rows: [{
            ...b,
            laundry_id: b.machine_id <= 7 ? 1 : 2,
            payment_id: p?.id || null,
            razorpay_payment_id: b.razorpay_payment_id || p?.razorpay_payment_id || null
          }]
        };
      }
      return { rows: [] };
    }

    // 15. Notifications insert
    if (trimmed.startsWith('INSERT INTO notifications')) {
      const n = {
        id: ++this.notificationSeq,
        student_id: params[0],
        type: params[1],
        message: params[2],
        read_at: null,
        created_at: new Date()
      };
      this.notifications.push(n);
      return { rows: [n] };
    }

    // 16. Audit log insert
    if (trimmed.startsWith('INSERT INTO audit_log')) {
      this.audit_log.push({
        actor_id: params[0],
        action: params[1],
        entity: params[2],
        entity_id: params[3],
        details: params[4],
        created_at: new Date()
      });
      return { rows: [] };
    }

    // Default transaction commands
    if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(trimmed)) {
      return { rows: [] };
    }

    return { rows: [] };
  }

  async connect() {
    return {
      query: (text, params) => this.query(text, params),
      release: () => {}
    };
  }
}
