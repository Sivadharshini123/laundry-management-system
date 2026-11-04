import React, { useEffect, useState } from 'react';
import { Shield, Activity, AlertTriangle, RefreshCw, Clock, DollarSign, Power, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';

export default function StaffDashboard() {
  const { token, isStaff } = useAuth();
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'alerts' | 'audit'
  const [machines, setMachines] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState(null);

  // Edit modal state
  const [editingMachine, setEditingMachine] = useState(null);
  const [priceInr, setPriceInr] = useState('');
  const [slotMinutes, setSlotMinutes] = useState('');
  const [outOfService, setOutOfService] = useState(false);
  const [updateReason, setUpdateReason] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [mRes, dRes, aRes] = await Promise.all([
        fetch('/api/staff/machines', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/staff/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/staff/audit-logs?limit=30', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (mRes.ok) setMachines((await mRes.json()).machines || []);
      if (dRes.ok) setDashboardData(await dRes.json());
      if (aRes.ok) setAuditLogs((await aRes.json()).logs || []);
    } catch (err) {
      setError('Failed to fetch staff data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff) {
      fetchData();
    }
  }, [isStaff, token]);

  // Listen for real-time staff alerts & machine telemetry updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchData();
    };

    socket.on('machine:update', handleUpdate);
    socket.on('machine:unassigned_running', handleUpdate);
    socket.on('machine:stale_heartbeat', handleUpdate);
    socket.on('booking:failed', handleUpdate);

    return () => {
      socket.off('machine:update', handleUpdate);
      socket.off('machine:unassigned_running', handleUpdate);
      socket.off('machine:stale_heartbeat', handleUpdate);
      socket.off('booking:failed', handleUpdate);
    };
  }, [socket]);

  const handleEditClick = (m) => {
    setEditingMachine(m);
    setPriceInr((m.price_paise / 100).toFixed(2));
    setSlotMinutes(m.slot_minutes.toString());
    setOutOfService(m.out_of_service || false);
    setUpdateReason('');
  };

  const handleSaveMachineConfig = async (e) => {
    e.preventDefault();
    if (!editingMachine) return;
    setSaving(true);
    setError(null);

    try {
      const pricePaise = Math.round(parseFloat(priceInr) * 100);
      const minutes = parseInt(slotMinutes, 10);

      const res = await fetch(`/api/staff/machines/${editingMachine.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          price_paise: pricePaise,
          slot_minutes: minutes,
          out_of_service: outOfService,
          reason: updateReason || 'Staff maintenance update'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update machine');

      setStatusMessage(`Machine #${editingMachine.id} successfully updated`);
      setEditingMachine(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClearClothes = async (machineId) => {
    try {
      const res = await fetch(`/api/staff/machines/${machineId}/clear-clothes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusMessage(`Machine #${machineId} drum cleared and marked idle.`);
        fetchData();
      }
    } catch (err) {
      setError('Failed to clear clothes');
    }
  };

  if (!isStaff) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-rose-200 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          This dashboard requires authenticated staff role credentials. Please log in with a staff account.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Operations Console</h1>
            <p className="text-xs text-slate-500">Live hardware telemetry, booking reconciliation & maintenance controls</p>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Machine Grid ({machines.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'alerts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Alerts & Reconciliations</span>
            {dashboardData?.unassigned_running_machines?.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'audit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Log
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: LIVE MACHINE GRID */}
      {activeTab === 'grid' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {machines.map((m) => (
              <div
                key={m.id}
                className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                  m.out_of_service
                    ? 'border-rose-300 bg-rose-50/20'
                    : m.is_stale
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200/80 shadow-sm'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {m.laundry_name}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">{m.label}</h3>
                    </div>
                    <StatusBadge status={m.display_status} />
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-[11px] space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>Telemetry State:</span>
                      <span className="font-semibold text-slate-800">{m.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Booking:</span>
                      <span className="font-semibold text-slate-800">
                        {m.active_booking_id ? `#${m.active_booking_id} (${m.active_booking_status})` : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate & Duration:</span>
                      <span className="font-semibold text-slate-800">
                        ₹{(m.price_paise / 100).toFixed(2)} • {m.slot_minutes}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Heartbeat:</span>
                      <span className={`font-mono text-[10px] ${m.is_stale ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                        {m.last_seen ? new Date(m.last_seen).toLocaleTimeString() : 'Never'}
                      </span>
                    </div>
                  </div>

                  {m.out_of_service && (
                    <div className="px-2 py-1 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                      FLAGGED OUT OF SERVICE
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {m.state === 'done' && (
                    <button
                      onClick={() => handleClearClothes(m.id)}
                      className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold hover:bg-amber-100"
                    >
                      Clear Drum
                    </button>
                  )}
                  <button
                    onClick={() => handleEditClick(m)}
                    className="ml-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-semibold transition-colors"
                  >
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ALERTS & RECONCILIATIONS */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Unassigned running machines alert */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Unassigned Running Machines ({dashboardData?.unassigned_running_machines?.length || 0})</span>
            </h3>
            {dashboardData?.unassigned_running_machines?.length === 0 ? (
              <p className="text-xs text-slate-400">No unassigned running machines detected.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {dashboardData.unassigned_running_machines.map((u, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs text-rose-800">
                    <div>
                      <span className="font-bold">{u.machine_label}</span> is drawing power without an active booking.
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Reported: {new Date(u.last_seen).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Failed Bookings with Automatic Refunds */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span>Failed Bookings with Automatic Full Refunds ({dashboardData?.failed_bookings?.length || 0})</span>
            </h3>
            {dashboardData?.failed_bookings?.length === 0 ? (
              <p className="text-xs text-slate-400">No failed bookings recorded.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {dashboardData.failed_bookings.map((f, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">Booking #{f.id}</span> on {f.machine_label}
                      <span className="text-slate-500 block text-[11px]">
                        Reason: {f.reason_code} • Refund: ₹{(f.amount_paise / 100).toFixed(2)} ({f.refund_status})
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {f.razorpay_refund_id || 'Processed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Uncollected Clothes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Uncollected Clothes ({dashboardData?.uncollected_clothes?.length || 0})</span>
            </h3>
            {dashboardData?.uncollected_clothes?.length === 0 ? (
              <p className="text-xs text-slate-400">All completed loads have been collected.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {dashboardData.uncollected_clothes.map((c, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{c.machine_label}</span>
                      <span className="text-slate-500 block text-[11px]">
                        Waiting for {Math.round(c.minutes_waiting || 0)} minutes since finish.
                      </span>
                    </div>
                    <button
                      onClick={() => handleClearClothes(c.machine_id)}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100"
                    >
                      Clear Drum
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG VIEWER */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Immutable Audit Trail (Section 2 & 11)</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono text-[11px]">#{log.id}</td>
                    <td className="p-3 text-[11px] text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-3 font-medium">{log.actor_email || 'System'}</td>
                    <td className="p-3 font-semibold text-slate-900">{log.action}</td>
                    <td className="p-3">{log.entity} #{log.entity_id}</td>
                    <td className="p-3 max-w-xs font-mono text-[10px] truncate text-slate-500">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Machine Configuration Modal */}
      {editingMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Configure {editingMachine.label}
            </h3>

            <form onSubmit={handleSaveMachineConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price per Slot (INR)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={priceInr}
                  onChange={(e) => setPriceInr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slot Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  min={15}
                  max={120}
                  value={slotMinutes}
                  onChange={(e) => setSlotMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="oos"
                  checked={outOfService}
                  onChange={(e) => setOutOfService(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <label htmlFor="oos" className="font-bold text-rose-700">
                  Mark Out of Service (Maintenance)
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Change (Audit Log)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Filter maintenance or price revision"
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMachine(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
