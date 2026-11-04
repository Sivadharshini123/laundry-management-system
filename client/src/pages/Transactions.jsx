import React, { useEffect, useState } from 'react';
import { Calendar, Clock, DollarSign, CheckCircle2, AlertCircle, RefreshCw, XCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function Transactions() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? A 100% full refund will be issued immediately.')) {
      return;
    }

    setError(null);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Cancellation failed');
      }

      setActionMessage('Booking successfully cancelled. Full refund issued immediately!');
      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Bookings & Transactions</h1>
        <p className="text-xs text-slate-500 mt-1">Review your machine reservations, payment receipts, and automated refund tracking.</p>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400">Loading your transaction records...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No bookings yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't reserved any laundry slots yet. Head over to the laundries tab to book your first slot.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const slotStart = new Date(booking.slot_start);
            const slotEnd = new Date(booking.slot_end);
            const canCancel = (booking.status === 'paid' || booking.status === 'pending_payment') && slotStart > new Date();

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-sm text-slate-900">Booking #{booking.id}</span>
                    <span className="text-xs text-slate-500">• {booking.laundry_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    <StatusBadge status={booking.status} />
                    <span className="text-sm font-bold text-blue-600">₹{booking.amount_inr}</span>
                  </div>
                </div>

                {/* Details row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="block text-[11px] text-slate-400 font-medium">Machine</span>
                    <span className="block font-semibold text-slate-800">{booking.machine_label}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="block text-[11px] text-slate-400 font-medium">Slot Timing</span>
                    <span className="block font-semibold text-slate-800">
                      {slotStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {slotEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="block text-[11px] text-slate-400 font-medium">Payment Reference</span>
                    <span className="block font-mono text-[11px] text-slate-700 truncate">
                      {booking.razorpay_payment_id || booking.razorpay_order_id || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Refund Notice (if any) */}
                {booking.refund_status && (
                  <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-teal-900">
                      <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                      <span>Automatic Full Refund Processed (₹{booking.refund_amount_inr})</span>
                    </div>
                    <p className="text-teal-800 text-[11px] pl-5">
                      <strong>Reason:</strong> {booking.refund_reason_text}
                    </p>
                    {booking.razorpay_refund_id && (
                      <p className="text-[10px] text-teal-600 pl-5 font-mono">
                        Razorpay Refund ID: {booking.razorpay_refund_id}
                      </p>
                    )}
                  </div>
                )}

                {/* Cancellation trigger */}
                {canCancel && (
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Free cancellation available before {slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                    </span>
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold transition-colors flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel & Full Refund</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
