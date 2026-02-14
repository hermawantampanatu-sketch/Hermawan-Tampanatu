
import React, { useState } from 'react';
import { BrainCircuit, Sparkles, Loader2, Save, ImageIcon } from 'lucide-react';
import { InventoryItem } from '../types';
import { editInventoryImage } from '../services/geminiService';

interface ImageAIToolProps {
  items: InventoryItem[];
  onUpdateItem: (id: string, newUrl: string) => void;
}

const ImageAITool: React.FC<ImageAIToolProps> = ({ items, onUpdateItem }) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedItem = items.find(i => i.id === selectedItemId);

  const handleProcess = async () => {
    if (!selectedItem?.imageUrl || !prompt) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch(selectedItem.imageUrl);
      const blob = await res.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const processed = await editInventoryImage(base64, prompt);
      setResultImage(processed);
    } catch (e: any) {
      setError("Gagal mengedit gambar. Pastikan API Key Gemini valid.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (resultImage && selectedItemId) {
      onUpdateItem(selectedItemId, resultImage);
      alert("Gambar produk berhasil diperbarui!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 text-slate-900">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 text-white flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Studio Gambar AI</h2>
          <p className="text-indigo-100 max-w-md">Gunakan Gemini 2.5 Flash untuk menyempurnakan atau memodifikasi visual inventaris Anda dengan bahasa alami.</p>
        </div>
        <BrainCircuit size={120} className="absolute -right-8 -bottom-8 opacity-20 transform -rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Barang yang Akan Diedit</label>
            <select className="w-full px-4 py-3 bg-slate-50 border rounded-2xl outline-none" value={selectedItemId} onChange={e => { setSelectedItemId(e.target.value); setResultImage(null); }}>
              <option value="">Pilih barang inventaris...</option>
              {items.map(i => (
                <option key={i.id} value={i.id}>{i.name} ({i.sku || 'Tanpa Merek'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsikan Perubahan</label>
            <textarea className="w-full px-4 py-3 bg-slate-50 border rounded-2xl outline-none min-h-[120px]" placeholder="Contoh: 'Tambahkan pencahayaan studio profesional', 'Hapus latar belakang', 'Buat tampilan bergaya vintage'..." value={prompt} onChange={e => setPrompt(e.target.value)} />
          </div>

          <div className="flex flex-wrap gap-2">
            {['Hapus Latar Belakang', 'Pencahayaan Studio', 'Filter Retro', 'Pertajam Gambar'].map(suggestion => (
              <button key={suggestion} onClick={() => setPrompt(suggestion)} className="text-xs font-semibold px-3 py-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100">{suggestion}</button>
            ))}
          </div>

          <button onClick={handleProcess} disabled={!selectedItemId || !prompt || isProcessing} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-indigo-100">
            {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {isProcessing ? 'Memproses dengan AI...' : 'Hasilkan Visual Baru'}
          </button>
          {error && <p className="text-rose-500 text-sm font-medium">{error}</p>}
        </div>

        <div className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-300 flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Kanvas Pratinjau</h3>
          <div className="flex-1 flex flex-col gap-6 justify-center">
            {resultImage ? (
              <div className="space-y-6">
                <img src={resultImage} alt="Hasil AI" className="w-full h-64 object-cover rounded-2xl shadow-xl border-4 border-white" />
                <div className="flex gap-4">
                  <button onClick={() => setResultImage(null)} className="flex-1 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 bg-white">Buang</button>
                  <button onClick={handleSave} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"><Save size={18} /> Terapkan ke Produk</button>
                </div>
              </div>
            ) : selectedItem ? (
              <div className="text-center space-y-4">
                <p className="text-slate-400 text-sm">Gambar Asli</p>
                <img src={selectedItem.imageUrl} className="w-full h-48 object-cover rounded-2xl opacity-60 grayscale-[0.5]" />
                <p className="text-xs font-mono text-slate-400">{selectedItem.name} - {selectedItem.sku}</p>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300"><ImageIcon size={40} /></div>
                <p className="text-slate-400 font-medium max-w-[200px] mx-auto">Pilih produk dan deskripsikan perubahan untuk mulai mengedit.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAITool;
