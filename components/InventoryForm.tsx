
import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryFormProps {
  item?: InventoryItem;
  onSave: (item: InventoryItem) => void;
  onClose: () => void;
}

const PRODUCT_OPTIONS = [
  'Lemari',
  'Kursi',
  'Meja',
  'AC',
  'TV',
  'Genset',
  'Sofa',
  'Springbad',
  'Mesin Hitung Uang',
  'Laptop',
  'Printer',
  'PC',
  'Lain-lain'
];

const CATEGORY_OPTIONS = [
  'Aset',
  'Inventaris',
  'Persediaan'
];

const InventoryForm: React.FC<InventoryFormProps> = ({ item, onSave, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedName, setSelectedName] = useState('');
  const [customName, setCustomName] = useState('');
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    sku: '',
    serialNumber: '',
    category: 'Aset',
    quantity: 0,
    unit: '',
    recordDate: new Date().toISOString().split('T')[0],
    price: 0,
    imageUrl: '',
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
      if (PRODUCT_OPTIONS.includes(item.name)) {
        setSelectedName(item.name);
        setCustomName('');
      } else {
        setSelectedName('Lain-lain');
        setCustomName(item.name);
      }
    } else {
      setSelectedName('');
      setCustomName('');
    }
  }, [item]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hapus karakter non-digit
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
    setFormData({ ...formData, price: numericValue });
  };

  const formatRupiah = (value: number | undefined) => {
    if (!value) return '';
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedName) {
      alert('Silakan pilih nama produk terlebih dahulu');
      return;
    }

    const finalName = selectedName === 'Lain-lain' ? customName : selectedName;
    
    if (!finalName.trim()) {
      alert('Nama produk tidak boleh kosong');
      return;
    }

    const newItem: InventoryItem = {
      ...formData as InventoryItem,
      name: finalName,
      id: item?.id || Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString()
    };
    onSave(newItem);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] text-slate-900">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{item ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Produk</label>
              <select 
                required 
                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none mb-3 transition-all ${!selectedName ? 'text-slate-400' : 'text-slate-900'}`} 
                value={selectedName} 
                onChange={e => setSelectedName(e.target.value)}
              >
                <option value="" disabled>-- Pilih Nama Produk --</option>
                {PRODUCT_OPTIONS.map(opt => (
                  <option key={opt} value={opt} className="text-slate-900">{opt}</option>
                ))}
              </select>
              
              {selectedName === 'Lain-lain' && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Sebutkan Nama Produk</label>
                  <input 
                    required 
                    className="w-full px-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={customName} 
                    onChange={e => setCustomName(e.target.value)} 
                    placeholder="Ketik nama produk manual..." 
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Merek</label>
              <input required className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="IKEA, Samsung, LG..." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Seri</label>
              <input className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.serialNumber} onChange={e => setFormData({ ...formData, serialNumber: e.target.value })} placeholder="SN-123456789" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori</label>
              <select className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {formData.category === 'Persediaan' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Stok Numerik (Opsional)</label>
                <input type="number" className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah Barang</label>
              <input 
                required
                className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={formData.unit} 
                onChange={e => setFormData({ ...formData, unit: e.target.value })} 
                placeholder="Contoh: 10 Pcs, 5 Unit, dll" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Pemilihan Tanggal</label>
              <input type="date" className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.recordDate} onChange={e => setFormData({ ...formData, recordDate: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Harga Satuan (Rp)</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={formatRupiah(formData.price)} 
                onChange={handlePriceChange} 
                placeholder="0"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Gambar Produk</label>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                      value={formData.imageUrl && !formData.imageUrl.startsWith('data:') ? formData.imageUrl : ''} 
                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} 
                      placeholder="Masukkan URL gambar atau unggah file..." 
                    />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  <button 
                    type="button" 
                    title="Unggah dari File"
                    className="p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-100 flex items-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={18} />
                    <span className="text-xs font-bold uppercase hidden sm:inline">File</span>
                  </button>
                  <button 
                    type="button" 
                    title="Generate Acak"
                    className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 border border-slate-200" 
                    onClick={() => setFormData({ ...formData, imageUrl: `https://picsum.photos/seed/${Math.random()}/600/400` })}
                  >
                    <Camera size={18} />
                  </button>
                </div>

                {formData.imageUrl && (
                  <div className="relative group w-full aspect-video rounded-2xl overflow-hidden border shadow-inner bg-slate-100">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, imageUrl: ''})}
                        className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-rose-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t mt-auto">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600">Batal</button>
            <button type="submit" className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200">Simpan Produk</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;
