
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, History, BrainCircuit, Search, Plus, Menu, X, LogOut, ShieldCheck, Download, Upload as UploadIcon, Database as DatabaseIcon, Save, AlertTriangle } from 'lucide-react';
import { InventoryItem, Transaction, UserProfile } from './types';
import Dashboard from './components/Dashboard';
import InventoryTable from './components/InventoryTable';
import TransactionHistory from './components/TransactionHistory';
import ImageAITool from './components/ImageAITool';
import SearchInsights from './components/SearchInsights';
import InventoryForm from './components/InventoryForm';
import Login from './components/Login';

// Default data hanya digunakan jika database benar-benar kosong (pertama kali buka)
const INITIAL_ITEMS: InventoryItem[] = [
  { id: '1', name: 'AC', sku: 'Samsung', serialNumber: 'SN-AC-00192', category: 'Aset', quantity: 15, unit: 'pcs', minThreshold: 5, recordDate: new Date().toISOString().split('T')[0], price: 4500000, lastUpdated: new Date().toISOString(), imageUrl: 'https://picsum.photos/seed/ac/400/300', status: 'APPROVED', createdBy: 'SYSTEM' }
];

const App: React.FC = () => {
  // Inisialisasi State dengan Try-Catch agar lebih Robust (Tahan Banting)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('logismart_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Gagal memuat user session:", e);
      return null;
    }
  });

  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('logismart_items');
      // Validasi: pastikan hasil parse adalah Array
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : INITIAL_ITEMS;
    } catch (e) {
      console.error("Database items korup/rusak, menggunakan default:", e);
      // Jangan return INITIAL_ITEMS jika error terjadi karena kuota, 
      // tapi di sini kita return default untuk safety agar app tidak crash
      return INITIAL_ITEMS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('logismart_transactions');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Database transaksi korup:", e);
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'history' | 'ai-edit' | 'insights'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);

  // Sync state ke LocalStorage dengan Error Handling (misal: Storage Full)
  useEffect(() => {
    try {
      localStorage.setItem('logismart_items', JSON.stringify(items));
      setLastSaved(new Date());
      setStorageWarning(false);
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        setStorageWarning(true);
        alert("PERINGATAN MEMORI PENUH: Database lokal penuh (biasanya karena terlalu banyak gambar). Hapus beberapa item atau gunakan Backup.");
      }
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('logismart_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.error("Gagal menyimpan transaksi:", e);
    }
  }, [transactions]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('logismart_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('logismart_user');
    }
  }, [currentUser]);

  const handleExportData = () => {
    const data = {
      items,
      transactions,
      exportedAt: new Date().toISOString(),
      version: "1.3"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database_logistik_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.items && Array.isArray(json.items)) {
          // Konfirmasi sebelum menimpa
          if (window.confirm(`Yakin ingin memulihkan database? Ini akan menimpa data saat ini dengan ${json.items.length} item dari file.`)) {
            setItems(json.items);
            if (json.transactions) setTransactions(json.transactions);
            alert('Database berhasil dipulihkan!');
          }
        } else {
          throw new Error('Format tidak valid');
        }
      } catch (err) {
        alert('Gagal mengimpor data. File mungkin rusak atau bukan format LogiSmart yang benar.');
      }
    };
    reader.readAsText(file);
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentUser(null);
  };

  const handleAddItem = (item: InventoryItem) => {
    const isAutoApproved = currentUser?.role === 'CHECKER' || currentUser?.role === 'MAKER_APPROVER';
    const newItem: InventoryItem = {
      ...item,
      status: isAutoApproved ? 'APPROVED' : 'PENDING',
      createdBy: editingItem ? editingItem.createdBy : (currentUser?.id || 'UNKNOWN')
    };

    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? newItem : i));
    } else {
      setItems(prev => [...prev, newItem]);
    }
    setShowItemForm(false);
    setEditingItem(undefined);
  };

  const handleApproveItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'APPROVED' } : item));
  };

  const handleRecordTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    setItems(prev => prev.map(item => {
      if (item.id === transaction.itemId) {
        const newQty = transaction.type === 'IN' ? item.quantity + transaction.quantity : item.quantity - transaction.quantity;
        return { ...item, quantity: Math.max(0, newQty), lastUpdated: new Date().toISOString() };
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Hapus barang ini dari database permanen?')) {
      setItems(prev => prev.filter(i => i.id !== id));
      setTransactions(prev => prev.filter(t => t.itemId !== id));
    }
  };

  const getTabTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Dasbor Utama';
      case 'inventory': return 'Manajemen Inventaris';
      case 'history': return 'Riwayat Transaksi';
      case 'ai-edit': return 'Studio Gambar AI';
      case 'insights': return 'Wawasan Pasar';
      default: return 'LogiSmart';
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden text-slate-900">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 transition-all duration-300 flex flex-col z-50 h-screen shrink-0`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="text-white" />
          </div>
          {isSidebarOpen && <span className="text-white font-bold text-xl tracking-tight">LogiSmart</span>}
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Dasbor" isOpen={isSidebarOpen} />
          <NavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={20} />} label="Inventaris" isOpen={isSidebarOpen} />
          <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={20} />} label="Transaksi" isOpen={isSidebarOpen} />
          <div className="py-4"><div className="border-t border-slate-700"></div></div>
          <NavItem active={activeTab === 'ai-edit'} onClick={() => setActiveTab('ai-edit'} icon={<BrainCircuit size={20} />} label="Studio AI" isOpen={isSidebarOpen} />
          <NavItem active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} icon={<Search size={20} />} label="Riset Pasar" isOpen={isSidebarOpen} />
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800 space-y-2">
          {isSidebarOpen && (
            <div className="px-4 py-3 bg-slate-800 rounded-xl mb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentUser.role}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${storageWarning ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                  <span className={`text-[9px] font-bold ${storageWarning ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {storageWarning ? 'MEMORI PENUH' : 'DB AKTIF'}
                  </span>
                </div>
              </div>
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
            </div>
          )}
          
          {isSidebarOpen && (
            <div className="flex flex-col gap-1 mb-2">
               <button 
                onClick={handleExportData}
                className="flex items-center gap-3 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all w-full"
              >
                <Download size={14} /> Backup Database (.json)
              </button>
              <label className="flex items-center gap-3 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer w-full">
                <UploadIcon size={14} /> Pulihkan Database
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
            </div>
          )}
          
          <button 
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer relative z-[60]"
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">Keluar Sesi</span>}
          </button>

          <button 
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="w-full flex items-center justify-center text-slate-500 hover:text-white py-2"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b bg-white flex items-center justify-between px-8 z-40 shrink-0">
          <div className="flex items-center gap-4">
             <h1 className="text-lg font-semibold text-slate-700">{getTabTitle()}</h1>
             <div className="hidden md:flex items-center gap-3 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200">
                {storageWarning ? (
                  <>
                    <AlertTriangle size={12} className="text-rose-500" /> 
                    <span className="text-rose-600">PENYIMPANAN PENUH</span>
                  </>
                ) : (
                  <>
                    <DatabaseIcon size={12} className="text-indigo-500" /> 
                    <span>LOKAL: {items.length} ITEM</span>
                  </>
                )}
                {lastSaved && (
                  <>
                    <div className="w-px h-3 bg-slate-300 mx-1"></div>
                    <Save size={12} className="text-emerald-500" />
                    <span className="text-emerald-600">
                      TERSIMPAN {lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </>
                )}
             </div>
          </div>
          <div className="flex items-center gap-4">
            {currentUser.id === 'P88390' && (
              <button 
                type="button"
                onClick={() => { setEditingItem(undefined); setShowItemForm(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-indigo-100"
              >
                <Plus size={18} /> Tambah Barang
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {activeTab === 'dashboard' && <Dashboard items={items} transactions={transactions} />}
          {activeTab === 'inventory' && (
            <InventoryTable 
              items={items} 
              currentUser={currentUser}
              onEdit={(item) => { setEditingItem(item); setShowItemForm(true); }} 
              onDelete={handleDeleteItem}
              onTransaction={handleRecordTransaction}
              onApprove={handleApproveItem}
            />
          )}
          {activeTab === 'history' && <TransactionHistory transactions={transactions} />}
          {activeTab === 'ai-edit' && <ImageAITool items={items} onUpdateItem={(id, url) => {
            setItems(prev => prev.map(i => i.id === id ? { ...i, imageUrl: url } : i));
          }} />}
          {activeTab === 'insights' && <SearchInsights />}
        </div>
      </main>

      {showItemForm && (
        <InventoryForm 
          item={editingItem} 
          onSave={handleAddItem} 
          onClose={() => setShowItemForm(false)} 
        />
      )}
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, label, isOpen }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all cursor-pointer ${
      active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    }`}
  >
    <div className="flex-shrink-0">{icon}</div>
    {isOpen && <span className="font-medium whitespace-nowrap">{label}</span>}
  </button>
);

export default App;
