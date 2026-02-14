
import React, { useState } from 'react';
import { Search, Globe, Link as LinkIcon, Loader2, Info, ChevronRight } from 'lucide-react';
import { getMarketInsights } from '../services/geminiService';
import { GroundingSource } from '../types';

const SearchInsights: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: GroundingSource[] } | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await getMarketInsights(query);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 text-slate-900">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest">
          <Globe size={14} /> Intelijen Pasar Global
        </div>
        <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Riset Pasar Langsung</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          Didukung Gemini 3 Flash. Dapatkan informasi terkini tentang tren rantai pasokan, harga pasar, dan ketersediaan barang secara real-time.
        </p>
      </div>

      <div className="relative group">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input 
              type="text"
              placeholder="Contoh: 'Harga pasar global Lembaran Aluminium 6061' atau 'Prospek pasokan semikonduktor 2025'"
              className="w-full pl-16 pr-6 py-5 bg-white border shadow-xl rounded-3xl outline-none focus:ring-4 focus:ring-indigo-100 text-lg transition-all"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading || !query.trim()} className="px-8 bg-indigo-600 text-white rounded-3xl font-bold flex items-center gap-3 hover:bg-indigo-700 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" /> : <ChevronRight />} Analisis
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <Globe className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-slate-700 font-bold text-xl">Menelusuri Basis Data Global</p>
            <p className="text-slate-400">Gemini sedang merangkum data pasar langsung dengan Search Grounding...</p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs italic">Ai</div>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Laporan Analisis Pasar</span>
              </div>
              <div className="text-slate-700 leading-relaxed space-y-4 whitespace-pre-wrap">
                {result.text}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Globe size={20} className="text-indigo-400" />
                <h3 className="font-bold text-lg">Referensi Sumber</h3>
              </div>
              <div className="space-y-4">
                {result.sources.map((src, i) => (
                  <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="block p-4 bg-slate-800 rounded-2xl border border-slate-700 group hover:bg-slate-700 transition-all">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-indigo-400 uppercase mb-1">Sumber {i+1}</span>
                      <LinkIcon size={14} className="text-slate-500 group-hover:text-white" />
                    </div>
                    <p className="text-sm font-medium line-clamp-2">{src.title}</p>
                  </a>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-slate-800">
                <div className="flex gap-3 text-slate-400 text-xs">
                  <Info size={24} className="shrink-0 text-indigo-500" />
                  <p>Search Grounding memastikan output AI diverifikasi terhadap hasil pencarian langsung untuk akurasi perkiraan logistik yang lebih tinggi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInsights;
