
import React from 'react';
import { CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis } from 'recharts';
import { Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import { InventoryItem, Transaction } from '../types';

interface DashboardProps {
  items: InventoryItem[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ items, transactions }) => {
  const approvedItems = items.filter(i => i.status === 'APPROVED');
  const pendingItems = items.filter(i => i.status === 'PENDING').length;
  
  const totalStock = approvedItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalValue = approvedItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const lowStockItems = approvedItems.filter(item => item.quantity <= item.minThreshold).length;
  
  const recentTransactions = transactions.slice(0, 5);

  const stockByCategory = approvedItems.reduce((acc: any[], item) => {
    const existing = acc.find(a => a.name === item.category);
    if (existing) {
      existing.value += item.quantity;
    } else {
      acc.push({ name: item.category, value: item.quantity });
    }
    return acc;
  }, []);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Stok Barang" value={totalStock.toLocaleString('id-ID')} icon={<Package className="text-blue-500" />} trend="+2.4%" />
        <StatCard title="Nilai Aset" value={`Rp ${totalValue.toLocaleString('id-ID')}`} icon={<DollarSign className="text-emerald-500" />} trend="+5.1%" />
        <StatCard title="Butuh Persetujuan" value={pendingItems.toString()} icon={<Clock className="text-amber-500" />} trend={pendingItems > 0 ? "Segera Periksa" : "Semua Bersih"} isAlert={pendingItems > 0} />
        <StatCard title="Peringatan Stok" value={lowStockItems.toString()} icon={<AlertTriangle className="text-rose-500" />} isAlert={lowStockItems > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Distribusi Barang (Approved)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, 'Jumlah']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stockByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Aktivitas Terkini</h3>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {tx.type === 'IN' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{tx.itemName}</p>
                      <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">{tx.user}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <p>Belum ada transaksi terbaru</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend?: string; isAlert?: boolean }> = ({ title, value, icon, trend, isAlert }) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
      {trend && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isAlert ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
  </div>
);

export default Dashboard;
