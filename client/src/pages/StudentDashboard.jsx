import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Waves, MapPin, Clock, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const [laundries, setLaundries] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch laundries
    fetch('/api/laundries')
      .then(res => res.json())
      .then(data => setLaundries(data.laundries || []))
      .catch(err => console.error(err));

    // Fetch active bookings
    if (token) {
      fetch('/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const active = (data.bookings || []).find(b => b.status === 'paid' || b.status === 'running');
          setActiveBooking(active || null);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-medium text-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Real-Time Campus Laundry</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Hi, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Reserve washers & dryers across campus, track live sensor power draw, and get notified the exact second your laundry is finished.
          </p>
        </div>
      </div>

      {/* Active Booking Banner (if any) */}
      {activeBooking && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/20 tracking-wider">
                {activeBooking.status}
              </span>
              <h3 className="font-bold text-sm sm:text-base">Active Reservation on {activeBooking.machine_label}</h3>
            </div>
            <p className="text-xs text-emerald-100">
              Slot: {new Date(activeBooking.slot_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(activeBooking.slot_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {activeBooking.laundry_name}
            </p>
          </div>
          <Link
            to="/transactions"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white text-emerald-800 text-xs font-bold shadow hover:bg-emerald-50 transition-colors"
          >
            View Details
          </Link>
        </div>
      )}

      {/* Campus Laundries Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campus Laundries</h2>
            <p className="text-xs text-slate-500">Select a facility to check live machine availability</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {laundries.map((laundry) => (
            <div
              key={laundry.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Waves className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    Operational
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{laundry.name}</h3>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{laundry.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="block text-xs text-slate-400 font-medium">Washers</span>
                    <span className="block text-base font-bold text-slate-800">{laundry.total_washers || 4}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="block text-xs text-slate-400 font-medium">Dryers</span>
                    <span className="block text-base font-bold text-slate-800">{laundry.total_dryers || 3}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="block text-xs text-slate-400 font-medium">Total</span>
                    <span className="block text-base font-bold text-slate-800">{laundry.total_machines || 7}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{laundry.opening_hours}</span>
                </div>

                <Link
                  to={`/laundry/${laundry.id}`}
                  className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <span>View Machines</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Highlights / Service Commitments */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">5-Minute Payment Window</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Slots are held exclusively for you during checkout without double-booking.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">100% Full Refunds</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Free instant cancellation before slot starts, or automatic refund if machine fails to start.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">AI Assistant with RAG</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Check booking histories, refund policies, and fabric care guidance in plain language.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
