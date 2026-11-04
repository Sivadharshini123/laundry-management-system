import React from 'react';

export default function StatusBadge({ status }) {
  const map = {
    'Available': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'idle': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'In use': 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse',
    'running': 'bg-blue-100 text-blue-800 border-blue-300',
    'Finished': 'bg-amber-100 text-amber-800 border-amber-300',
    'done': 'bg-amber-100 text-amber-800 border-amber-300',
    'Reserved': 'bg-orange-100 text-orange-800 border-orange-300',
    'pending_payment': 'bg-orange-100 text-orange-800 border-orange-300',
    'Booked': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'paid': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'completed': 'bg-slate-100 text-slate-800 border-slate-300',
    'failed': 'bg-rose-100 text-rose-800 border-rose-300',
    'cancelled': 'bg-slate-100 text-slate-700 border-slate-200',
    'expired': 'bg-slate-100 text-slate-500 border-slate-200',
    'refunded': 'bg-teal-100 text-teal-800 border-teal-300',
    'offline': 'bg-rose-100 text-rose-800 border-rose-300',
    'Status unknown': 'bg-rose-100 text-rose-800 border-rose-300',
    'Passed': 'bg-slate-100 text-slate-400 border-slate-200'
  };

  const style = map[status] || 'bg-slate-100 text-slate-700 border-slate-300';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {status}
    </span>
  );
}
