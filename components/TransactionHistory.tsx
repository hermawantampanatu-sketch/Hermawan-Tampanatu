
import React from 'react';
import { History, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-in fade-in duration-500 text-slate-900">
      <div className="p-6 border-b bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <History size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Log Stok Barang</h2>
            <p className="text-sm text-slate-500">Daftar kronologis semua pergerakan inventaris</p>
          </div>
        </div>
        <div className="text-sm font-medium text-slate-500">
          Total Log: {transactions.length}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {transactions.length > 0 ? (
          transactions.map(tx => (
            <div key={tx.id} className="p-6 hover:bg-slate-50 transition-all flex items-center gap-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                tx.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {tx.type === 'IN' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <h4 className="font-bold text-slate-800">{tx.itemName}</h4>
                  <span className="text-xs text-slate-400 font-mono tracking-tighter">ID: {tx.id}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-slate-500 text-sm">
                    <Calendar size={14} />
                    <span>{new Date(tx.date).toLocaleDateString('id-ID')}</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-500">User: {tx.user}</span>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-xl font-black ${
                  tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                </div>
                <div className={`text-xs font-bold uppercase tracking-widest ${
                  tx.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  {tx.type === 'IN' ? 'DITERIMA' : 'DIKIRIM'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <History size={32} />
            </div>
            <p className="text-slate-400 font-medium">Belum ada transaksi tercatat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
