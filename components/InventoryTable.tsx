
import React, { useState } from 'react';
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft, Search, Filter, CheckCircle2, Clock, Calendar, Hash } from 'lucide-react';
import { InventoryItem, Transaction, TransactionType, UserProfile } from '../types';

interface InventoryTableProps {
  items: InventoryItem[];
  currentUser: UserProfile;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onTransaction: (tx: Transaction) => void;
  onApprove: (id: string) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items, currentUser, onEdit, onDelete, onTransaction, onApprove }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [txModal, setTxModal] = useState<{ show: boolean; item?: InventoryItem; type?: TransactionType }>({ show: false });
  const [qty, setQty] = useState(0);

  const categories = ['Semua', ...new Set(items.map(i => i.category))];

  const isInputUser = currentUser.id === 'P88390';
  const isMakerUser = currentUser.id === 'P82334';
  const isCheckerUser = currentUser.id === 'P81955';

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTxSubmit = () => {
    if (!txModal.item || !txModal.type || qty <= 0) return;
    
    onTransaction({
      id: Math.random().toString(36).substr(2, 9),
      itemId: txModal.item.id,
      itemName: txModal.item.name,
      type: txModal.type,
      quantity: qty,
      date: new Date().toISOString(),
      user: currentUser.name
    });
    
    setTxModal({ show: false });
    setQty(0);
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari merek, nomor seri, atau nama barang..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="text-slate-400" size={18} />
          <select 
            className="bg-slate-50 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Detail Barang</th>
              <th className="px-6 py-4">Merek</th>
              <th className="px-6 py-4">Nomor Seri</th>
              <th className="px-6 py-4">Jumlah Barang</th>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4 text-right">Harga</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group text-sm">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img 
                        src={item.imageUrl || `https://picsum.photos/seed/${item.id}/80/80`} 
                        alt={item.name} 
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                      />
                      <div className={`absolute -top-1 -right-1 rounded-full p-0.5 border-2 border-white shadow-sm ${item.status === 'PENDING' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                        {item.status === 'PENDING' ? <Clock size={8} className="text-white" /> : <CheckCircle2 size={8} className="text-white" />}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">{item.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">{item.sku}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-xs">
                    <Hash size={12} className="text-slate-300" />
                    {item.serialNumber || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                    item.quantity <= 2 && item.category === 'Persediaan'
                      ? 'bg-rose-100 text-rose-600' 
                      : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {item.unit || `${item.quantity} pcs`}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Calendar size={12} className="text-slate-300" />
                    {item.recordDate || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-700">
                  Rp{item.price.toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1">
                    {item.status === 'PENDING' && (isMakerUser || isCheckerUser) && (
                      <button onClick={() => onApprove(item.id)} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors" title="Setujui">
                        <CheckCircle2 size={16} />
                      </button>
                    )}

                    {item.status === 'APPROVED' && isInputUser && (
                      <>
                        <button onClick={() => setTxModal({ show: true, item, type: 'IN' })} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Masuk">
                          <ArrowUpRight size={16} />
                        </button>
                        <button onClick={() => setTxModal({ show: true, item, type: 'OUT' })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Keluar">
                          <ArrowDownLeft size={16} />
                        </button>
                      </>
                    )}

                    {isInputUser && (
                      <button onClick={() => onEdit(item)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                    )}

                    {isCheckerUser && (
                      <button onClick={() => onDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {txModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border text-slate-900">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Catat Barang {txModal.type === 'IN' ? 'Masuk' : 'Keluar'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">Barang: <span className="font-semibold">{txModal.item?.name}</span></p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Jumlah</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setTxModal({ show: false })} className="flex-1 px-4 py-2 border rounded-xl hover:bg-slate-50 font-medium">Batal</button>
              <button 
                onClick={handleTxSubmit}
                disabled={qty <= 0}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium disabled:opacity-50"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
