import React, { useState } from 'react';
import { X, RefreshCw, Camera, Image as ImageIcon } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function ScanModal({ user, setIsScanModalOpen, onScanSuccess }) {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleScanNota = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result.split(',')[1];

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json"
          }
        });

        const prompt = `Anda adalah asisten keuangan AI. Analisis gambar yang diunggah.
        
Tugas Anda:
1. Pastikan gambar tersebut adalah struk belanja/nota/faktur. Jika BUKAN struk, kembalikan "isReceipt": false.
2. Jika ADALAH struk, ekstrak informasi berikut:
   - "item": Nama Toko atau Nama Merchant. Jika tidak ada, gunakan nama barang utama.
   - "amount": Total belanja (angka bulat saja, tanpa titik atau koma. Contoh: 15000).
   - "category": Kategori. Pilih salah satu HANYA dari: Food, Transport, Lifestyle, Edu, Snacks, Coffee.
   - "isReceipt": true

Contoh JSON Valid:
{ "isReceipt": true, "item": "Indomaret", "amount": 25500, "category": "Snacks" }
Contoh JSON Tidak Valid / Bukan Struk:
{ "isReceipt": false, "item": "", "amount": 0, "category": "" }`;

        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        
        const data = JSON.parse(responseText);

        if (data.isReceipt === false) {
          throw new Error("Gambar yang diunggah tidak terdeteksi sebagai struk belanja valid.");
        }

        if (onScanSuccess) {
          onScanSuccess(data);
        } else {
          setIsScanModalOpen(false);
        }
        setIsScanning(false);

      } catch (error) {
        setErrorMsg(`Gagal memproses nota: ${error.message}`);
        setIsScanning(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 w-full max-w-md rounded-t-[32px] md:rounded-[32px] p-6 md:p-8 text-center text-slate-800 dark:text-slate-100 shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg md:text-xl font-bold capitalize tracking-tight">Ambil Foto Nota</h3>
          <button onClick={() => setIsScanModalOpen(false)} disabled={isScanning} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 p-2"><X size={24} /></button>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm mb-4 border border-rose-100 text-left font-medium">
            {errorMsg}
          </div>
        )}

        {isScanning ? (
          <div className="border-2 border-dashed border-blue-500 rounded-[32px] p-10 md:p-12 flex flex-col items-center gap-4 bg-blue-50 my-4">
            <RefreshCw className="animate-spin text-blue-600" size={40} />
            <p className="font-bold text-blue-600 capitalize tracking-widest text-xs animate-pulse">Memproses AI...</p>
          </div>
        ) : (
          <div className="space-y-4 mb-4">
            <label className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 md:p-6 flex flex-col items-center gap-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer">
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScanNota} />
              <Camera size={32} className="text-blue-600" />
              <p className="font-bold text-slate-700 dark:text-slate-200 capitalize tracking-widest text-[10px] md:text-xs">Ambil Foto Baru</p>
            </label>

            <label className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 md:p-6 flex flex-col items-center gap-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleScanNota} />
              <ImageIcon size={32} className="text-sky-500" />
              <p className="font-bold text-slate-700 dark:text-slate-200 capitalize tracking-widest text-[10px] md:text-xs">Impor Dari Galeri</p>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanModal;
