import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RazorpayModal({ orderData, booking, onPaymentSuccess, onCancel }) {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 minutes = 300s
  const [error, setError] = useState(null);

  // Live countdown timer for the 5-minute hold window
  useEffect(() => {
    const expiresAt = booking?.hold_expires_at ? new Date(booking.hold_expires_at).getTime() : Date.now() + 300000;
    
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        setError('Reservation window has expired. The slot has been released.');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  const handleTestPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/simulate-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: orderData.orderId,
          payment_id: `pay_test_${Date.now()}`
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment capture failed');
      }

      onPaymentSuccess(data.result);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleRealRazorpayCheckout = () => {
    if (!window.Razorpay) {
      handleTestPayment();
      return;
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: 'INR',
      name: 'Campus Laundry',
      description: `Slot Booking #${booking.id}`,
      order_id: orderData.orderId,
      handler: function (response) {
        handleTestPayment(); // Confirms payment via backend
      },
      prefill: {
        name: user?.name,
        email: user?.email,
      },
      theme: {
        color: '#2563eb'
      },
      modal: {
        ondismiss: function () {
          // Stay in modal or allow user to cancel
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      console.warn('Real Razorpay modal failed to open, using test checkout fallback', e);
      handleTestPayment();
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
          <div className="inline-flex p-3 rounded-xl bg-white/10 mb-3">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Complete Payment</h3>
          <p className="text-xs text-blue-100 mt-1">Razorpay Secure Test Checkout</p>
        </div>

        {/* Hold Timer Alert */}
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-2.5 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center space-x-1.5 font-medium">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Hold expires in:</span>
          </div>
          <span className="font-bold text-sm tracking-mono text-amber-900">{timerDisplay}</span>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Booking Summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Booking Reference</span>
              <span className="font-semibold text-slate-800">#{booking.id}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Slot Window</span>
              <span className="font-medium text-slate-800">
                {new Date(booking.slot_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.slot_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-900 text-sm">Total Payable</span>
              <span className="font-bold text-blue-600 text-sm">₹{(orderData.amount / 100).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Full refund protection: Cancel anytime before start with instant 100% refund.</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleRealRazorpayCheckout}
              disabled={loading || secondsRemaining <= 0}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pay ₹{(orderData.amount / 100).toFixed(2)} (Test Mode)</span>
                </>
              )}
            </button>

            <button
              onClick={onCancel}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Cancel Reservation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
