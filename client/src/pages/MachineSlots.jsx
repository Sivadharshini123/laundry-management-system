import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, Calendar, ShieldCheck, AlertCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';
import RazorpayModal from '../components/RazorpayModal';

export default function MachineSlots() {
  const { id } = useParams();
  const { token, isAuthenticated } = useAuth();
  const { socket, joinLaundry, leaveLaundry } = useSocket();
  const navigate = useNavigate();

  const [machine, setMachine] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Active checkout state
  const [activeReservation, setActiveReservation] = useState(null); // { booking, order }
  const [reservingSlot, setReservingSlot] = useState(null);

  const fetchSlots = async () => {
    try {
      const res = await fetch(`/api/machines/${id}/slots?date=${date}`);
      const data = await res.json();
      if (res.ok) {
        setMachine(data.machine);
        setSlots(data.slots || []);
        if (data.machine?.laundry_id) {
          joinLaundry(data.machine.laundry_id);
        }
      } else {
        setError(data.error || 'Failed to load slots');
      }
    } catch (err) {
      setError('Network error loading slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [id, date]);

  // Real-time socket events for slot reservations and releases
  useEffect(() => {
    if (!socket) return;

    const handleSlotUpdate = () => {
      fetchSlots();
    };

    socket.on('slot:reserved', handleSlotUpdate);
    socket.on('slot:booked', handleSlotUpdate);
    socket.on('slot:released', handleSlotUpdate);

    return () => {
      socket.off('slot:reserved', handleSlotUpdate);
      socket.off('slot:booked', handleSlotUpdate);
      socket.off('slot:released', handleSlotUpdate);
    };
  }, [socket]);

  const handleReserve = async (slot) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setError(null);
    setReservingSlot(slot.slotStart);

    try {
      const res = await fetch('/api/bookings/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          machine_id: parseInt(id, 10),
          slot_start: slot.slotStart,
          slot_end: slot.slotEnd
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Reservation failed');
      }

      // Open Razorpay payment modal
      setActiveReservation({
        booking: data.booking,
        order: data.order
      });
      fetchSlots();
    } catch (err) {
      setError(err.message);
    } finally {
      setReservingSlot(null);
    }
  };

  const handleJoinWaitingList = async (slot) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setError(null);
    setActionSuccess(null);

    try {
      const res = await fetch('/api/bookings/waiting-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          machine_id: parseInt(id, 10),
          slot_start: slot.slotStart
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join waiting list');

      setActionSuccess('Added to waiting list! If this slot opens up, you will get a 3-minute priority offer.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePaymentSuccess = (result) => {
    setActiveReservation(null);
    navigate('/transactions');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button & Machine Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Facility</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {machine?.label || `Machine #${id}`}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Duration: {machine?.slot_minutes || 45} mins • Price: ₹{((machine?.price_paise || 6000) / 100).toFixed(2)}
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs font-semibold text-slate-800 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-700">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Booking Rules Reminder */}
      <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 flex items-start space-x-3">
        <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <span className="font-bold">5-Minute Payment Window Policy</span>
          <p className="text-blue-800/90 text-[11px]">
            Reserving an available slot places an exclusive 5-minute hold on it for checkout. You can cancel any booking before the slot start time for a 100% immediate full refund.
          </p>
        </div>
      </div>

      {/* Slots List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Available Time Slots for {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {slots.map((slot, idx) => {
            const startTimeStr = new Date(slot.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTimeStr = new Date(slot.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const isAvailable = slot.state === 'Available';
            const isReserving = reservingSlot === slot.slotStart;

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isAvailable
                    ? 'bg-white border-slate-200/90 shadow-sm hover:border-blue-300 hover:shadow-md'
                    : 'bg-slate-50 border-slate-200/60 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{startTimeStr} - {endTimeStr}</span>
                  </div>
                  <StatusBadge status={slot.state} />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">₹{(slot.pricePaise / 100).toFixed(2)}</span>

                  {isAvailable && (
                    <button
                      onClick={() => handleReserve(slot)}
                      disabled={isReserving}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all disabled:opacity-50"
                    >
                      {isReserving ? 'Holding...' : 'Reserve'}
                    </button>
                  )}

                  {slot.state === 'Booked' && (
                    <button
                      onClick={() => handleJoinWaitingList(slot)}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 text-[11px] font-semibold"
                    >
                      Join Waitlist
                    </button>
                  )}

                  {slot.state === 'Reserved' && (
                    <span className="text-[11px] text-orange-600 font-medium">In Checkout</span>
                  )}

                  {slot.state === 'Status unknown' && (
                    <span className="text-[11px] text-rose-600 font-medium">Hardware Offline</span>
                  )}

                  {slot.state === 'Passed' && (
                    <span className="text-[11px] text-slate-400 font-medium">Slot Passed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Razorpay Modal */}
      {activeReservation && (
        <RazorpayModal
          booking={activeReservation.booking}
          orderData={activeReservation.order}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => {
            setActiveReservation(null);
            fetchSlots();
          }}
        />
      )}
    </div>
  );
}
