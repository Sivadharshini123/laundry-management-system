import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Waves, Wind, Clock, ArrowLeft, Zap, Sparkles, Filter } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';

export default function LaundryDetail() {
  const { id } = useParams();
  const { socket, joinLaundry, leaveLaundry } = useSocket();
  const [laundry, setLaundry] = useState(null);
  const [machines, setMachines] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'washer' | 'dryer'
  const [loading, setLoading] = useState(true);

  // Fetch initial laundry & machine data
  const fetchData = async () => {
    try {
      const [laundryRes, machinesRes] = await Promise.all([
        fetch(`/api/laundries/${id}`),
        fetch(`/api/machines?laundry_id=${id}`)
      ]);
      const lData = await laundryRes.json();
      const mData = await machinesRes.json();

      setLaundry(lData.laundry);
      setMachines(mData.machines || []);
    } catch (err) {
      console.error('Error fetching laundry machines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    joinLaundry(id);

    return () => {
      leaveLaundry(id);
    };
  }, [id]);

  // Socket.IO real-time event listener
  useEffect(() => {
    if (!socket) return;

    const handleMachineUpdate = (data) => {
      setMachines(prev =>
        prev.map(m => {
          if (m.id === data.machineId) {
            let newStatus = 'Available';
            if (data.state === 'running') newStatus = 'In use';
            else if (data.state === 'done') newStatus = 'Finished';
            else if (data.state === 'offline') newStatus = 'Status unknown';

            return {
              ...m,
              status: newStatus,
              estimated_minutes_left: data.estimatedMinutesLeft !== undefined ? data.estimatedMinutesLeft : m.estimated_minutes_left,
              last_seen: data.lastSeen || m.last_seen
            };
          }
          return m;
        })
      );
    };

    const handleConfigChange = (data) => {
      setMachines(prev =>
        prev.map(m => m.id === data.id ? { ...m, ...data } : m)
      );
    };

    socket.on('machine:update', handleMachineUpdate);
    socket.on('machine:config_changed', handleConfigChange);

    return () => {
      socket.off('machine:update', handleMachineUpdate);
      socket.off('machine:config_changed', handleConfigChange);
    };
  }, [socket]);

  const filteredMachines = machines.filter(m => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Laundries</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {laundry?.name || 'Laundry Facility'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">{laundry?.address} • Operating: {laundry?.opening_hours}</p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({machines.length})
          </button>
          <button
            onClick={() => setFilterType('washer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'washer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Washers
          </button>
          <button
            onClick={() => setFilterType('dryer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'dryer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dryers
          </button>
        </div>
      </div>

      {/* Live Machine Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredMachines.map((machine) => (
          <div
            key={machine.id}
            className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
              machine.status === 'Status unknown'
                ? 'border-rose-200 bg-rose-50/20'
                : 'border-slate-200/80 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl ${machine.type === 'washer' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                  {machine.type === 'washer' ? <Waves className="w-6 h-6" /> : <Wind className="w-6 h-6" />}
                </div>
                <StatusBadge status={machine.status} />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Machine #{machine.id} • {machine.type}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{machine.label}</h3>
              </div>

              {/* Status details / estimated minutes left */}
              {machine.status === 'In use' && (
                <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-2.5 text-xs text-blue-900 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    <span>Est. time remaining:</span>
                  </div>
                  <span className="font-bold text-blue-700">~{machine.estimated_minutes_left || 45} mins</span>
                </div>
              )}

              {machine.status === 'Finished' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 font-medium">
                  Clothes finished, awaiting collection.
                </div>
              )}

              {machine.status === 'Status unknown' && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800">
                  Telemetry heartbeat unavailable. Machine booking disabled.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="block text-[11px] text-slate-400 font-medium">Slot ({machine.slot_minutes} min)</span>
                <span className="block text-sm font-bold text-slate-900">₹{(machine.price_paise / 100).toFixed(2)}</span>
              </div>

              {machine.status === 'Status unknown' || machine.out_of_service ? (
                <button
                  disabled
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
                >
                  Unavailable
                </button>
              ) : (
                <Link
                  to={`/machine/${machine.id}/slots`}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Book Slot
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
