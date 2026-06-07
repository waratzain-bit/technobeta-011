import React, { useState } from "react";
import { Settings, Layout, Link, Database, Trash2, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, FileText } from "lucide-react";
import { SheetsConfig } from "../types";

interface SettingsWorkspaceProps {
  websiteTitle: string;
  onUpdateWebsiteTitle: (title: string) => void;
  sheetsConfig: SheetsConfig;
  onSaveUrl: (url: string) => void;
  onDisconnect: () => void;
  onResetToDefault: () => void;
  postsCount: number;
  adsensePubId: string;
  onUpdateAdsensePubId: (pubId: string) => void;
}

export default function SettingsWorkspace({
  websiteTitle,
  onUpdateWebsiteTitle,
  sheetsConfig,
  onSaveUrl,
  onDisconnect,
  onResetToDefault,
  postsCount,
  adsensePubId,
  onUpdateAdsensePubId,
}: SettingsWorkspaceProps) {
  const [tempTitle, setTempTitle] = useState(websiteTitle);
  const [sheetsUrl, setSheetsUrl] = useState(sheetsConfig.webAppUrl);
  const [tempAdsenseId, setTempAdsenseId] = useState(adsensePubId);
  const [isSaved, setIsSaved] = useState(false);
  const [isAdsenseSaved, setIsAdsenseSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleSaveTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempTitle.trim()) {
      alert("Judul website tidak boleh kosong!");
      return;
    }
    onUpdateWebsiteTitle(tempTitle.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveSheetsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUrl(sheetsUrl.trim());
    alert("Koneksi spreadsheet tersimpan!");
  };

  const confirmReset = () => {
    if (confirm("Apakah Anda yakin ingin menyetel ulang data postingan kembali ke bawaan sistem? Semua postingan buatan lokal akan terhapus.")) {
      onResetToDefault();
      alert("Data berhasil disetel ulang!");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn select-text text-neutral-300">
      
      {/* Banner */}
      <div className="flex flex-col gap-2 pb-4 border-b border-neutral-850">
        <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2 font-mono uppercase tracking-wider">
          <Settings className="h-5 w-5 text-emerald-400" />
          Setelan Publikasi & Database
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
          Kelola rincian konfigurasi visual situs web, judul landing page, integrasi database Google Sheets nir-server, serta preferensi editorial siber Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Column forms */}
        <div className="flex flex-col gap-6">
          
          {/* Form Judul Website */}
          <div className="bg-[#121110] border border-neutral-850 rounded-2xl p-5 md:p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 font-mono uppercase">
              <Layout className="h-4.5 w-4.5 text-emerald-400" />
              Sesuaikan Judul Website
            </h3>
            
            <form onSubmit={handleSaveTitleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Judul / Brand Utama</label>
                <input
                  type="text"
                  placeholder="Contoh: Technobeta / Mading Zain"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3 rounded-xl text-neutral-200 outline-none text-xs"
                />
              </div>

              {isSaved && (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Judul website diperbarui secara instan!
                </span>
              )}

              <button
                type="submit"
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all shadow-md mt-1"
              >
                Simpan Judul Baru
              </button>
            </form>
          </div>

          {/* Form Database Connection */}
          <div className="bg-[#121110] border border-neutral-850 rounded-2xl p-5 md:p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 font-mono uppercase">
              <Database className="h-4.5 w-4.5 text-emerald-400" />
              Database Google Sheets Link
            </h3>

            <p className="text-neutral-400 text-xs leading-relaxed">
              Koneksikan mading digital Anda dengan spreadsheet pribadi sebagai database penyimpanan yang tangguh, aman, dan tanpa biaya.
            </p>

            <form onSubmit={handleSaveSheetsSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Google Apps Script Web App URL</label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3 rounded-xl text-neutral-200 outline-none text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-2 mt-1">
                {sheetsConfig.isConnected ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Terhubung Online
                    </span>
                    <button
                      type="button"
                      onClick={onDisconnect}
                      className="text-[10px] font-mono font-bold text-red-400 hover:underline inline-block"
                    >
                      PUTUSKAN SINKRONISASI
                    </button>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl flex items-start gap-2 text-xs text-amber-300">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Mode Offline aktif. Data Anda saat ini disimpan dengan aman di memori lokal peramban Anda.</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="py-2.5 px-4 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-200 font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all shadow-md mt-1"
              >
                {sheetsConfig.isConnected ? "Perbarui Alamat URL" : "Hubungkan Spreadsheet"}
              </button>
            </form>
          </div>

          {/* Form Google AdSense & ads.txt */}
          <div className="bg-[#121110] border border-neutral-850 rounded-2xl p-5 md:p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 font-mono uppercase">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
              Setelan Google AdSense & ads.txt
            </h3>

            <p className="text-neutral-400 text-xs leading-relaxed">
              Konfigurasikan ID Penayang Google AdSense Anda untuk menyesuaikan mading digital {websiteTitle} ini agar memenuhi kualifikasi persetujuan Google AdSense.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              onUpdateAdsensePubId(tempAdsenseId.trim() || "pub-0000000000000000");
              setIsAdsenseSaved(true);
              setTimeout(() => setIsAdsenseSaved(false), 2500);
            }} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">ID Penayang Google AdSense (Publisher ID)</label>
                <input
                  type="text"
                  placeholder="Contoh: pub-0000000000000000"
                  value={tempAdsenseId}
                  onChange={(e) => setTempAdsenseId(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3 rounded-xl text-neutral-200 outline-none text-xs font-mono"
                />
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-900 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold font-mono text-neutral-500 uppercase">Baris Autorisasi Penayang Anda:</span>
                <code className="text-emerald-400 font-mono text-[10.5px] block select-all break-all leading-relaxed">
                  google.com, {tempAdsenseId || "pub-0000000000000000"}, DIRECT, f08c47fec0942fa0
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`google.com, ${tempAdsenseId || "pub-0000000000000000"}, DIRECT, f08c47fec0942fa0`);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="text-left text-[10px] font-mono text-emerald-400/80 hover:text-emerald-400 font-bold uppercase tracking-wider mt-1 hover:underline"
                >
                  {isCopied ? "✓ BARIS BERHASIL DISALIN!" : "📋 SALIN BARIS ADS.TXT"}
                </button>
              </div>

              <div className="text-[10.5px] leading-relaxed text-neutral-400 bg-neutral-950/40 p-3 rounded-xl border border-neutral-900">
                <p className="flex items-start gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-neutral-500 mt-0.5 shrink-0" />
                  <span>
                    Pastikan Anda telah membuat berkas teks <strong className="text-neutral-300">ads.txt</strong> pada direktori utama (<code className="text-neutral-300 font-mono text-[9px]">/public/ads.txt</code>) yang memuat baris ID penayang Anda yang unik di atas.
                  </span>
                </p>
              </div>

              {isAdsenseSaved && (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  ID Penayang AdSense disimpan & diaplikasikan!
                </span>
              )}

              <button
                type="submit"
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all shadow-md mt-1"
              >
                Simpan Setelan AdSense
              </button>
            </form>
          </div>

          {/* Pembersih Memori Local Storage */}
          <div className="bg-red-950/15 border border-red-900/20 rounded-2xl p-5 md:p-6 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-red-400 flex items-center gap-1 font-mono uppercase">
              <Trash2 className="h-4 w-4 text-red-500" />
              Area Penyetelan Ulang Data (Reset)
            </h3>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Jika memori peramban Anda penuh atau terdapat kegagalan struktur data lokal, Anda dapat menyetel ulang tulisan kembali ke draf prapustaka sistem. Tindakan ini bersifat permanen.
            </p>
            <button
              onClick={confirmReset}
              className="w-fit py-1.5 px-3 border border-red-900/50 hover:bg-red-900/10 text-red-400 font-mono text-[10px] font-bold uppercase rounded-lg transition-all"
            >
              Setel Ulang Data
            </button>
          </div>

        </div>

        {/* Right Column guidelines / checklist */}
        <div className="flex flex-col gap-4">
          
          <div className="bg-neutral-950/40 p-5 rounded-2xl border border-neutral-850 flex flex-col gap-4">
            <span className="font-bold text-neutral-200 text-xs uppercase font-mono flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Kepatuhan Kelulusan Google AdSense
            </span>

            <p className="text-neutral-400 text-xs leading-relaxed">
              Situs web {websiteTitle} ini dirancang mengikuti pedoman kualitas program Google Publisher Policies. Berikut adalah poin-poin kesiapan yang telah kami siapkan di dalam sasis Technobeta:
            </p>

            <ul className="flex flex-col gap-3 text-neutral-400 text-xs">
              <li className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-neutral-200">Konten Menarik dan Informatif</strong>
                  <p className="text-[11px] text-neutral-550 mt-0.5 leading-relaxed">Menggunakan model AI berkemampuan tinggi untuk menghasilkan draf awal informatif tentang teknologi, seni, serta desain.</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-neutral-200">Navigasi yang Jelas dan Mudah Dipahami</strong>
                  <p className="text-[11px] text-neutral-550 mt-0.5 leading-relaxed">Dilengkapi sidebar editorial multi-fungsi serta navigasi tumpukan hierarki yang responsif tanpa link jebakan.</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-neutral-200">Halaman Wajib Terintegrasi (Legal)</strong>
                  <p className="text-[11px] text-neutral-550 mt-0.5 leading-relaxed">Sudah terpasang Kebijakan Privasi standar yang menerangkan cookie pengiklan, Ketentuan Layanan, serta Disclaimer khusus asisten kognitif AI.</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-neutral-200">User Consent & GDPR Banner</strong>
                  <p className="text-[11px] text-neutral-550 mt-0.5 leading-relaxed">Melampirkan spanduk persetujuan penggunaan cookie guna menghargai transparansi perolehan data analitis pembaca.</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-neutral-200">Autorisasi Penayang (ads.txt)</strong>
                  <p className="text-[11px] text-neutral-550 mt-0.5 leading-relaxed">
                    Pastikan Anda telah membuat berkas teks ads.txt pada direktori utama (/public/ads.txt) yang memuat baris ID penayang Anda yang unik, seperti:
                    <code className="block bg-neutral-950 text-emerald-400 font-mono text-[10px] p-2 rounded-lg border border-neutral-900 mt-1.5 overflow-x-auto select-all">
                      google.com, {adsensePubId || "pub-0000000000000000"}, DIRECT, f08c47fec0942fa0
                    </code>
                  </p>
                </div>
              </li>
            </ul>

            <div className="bg-emerald-950/20 border border-emerald-900/30 p-3.5 rounded-xl text-[11px] leading-relaxed text-emerald-300">
              <strong>Info Ringkasan:</strong> Terpasang {postsCount} draf tulisan di mading saat ini. Setiap artikel dilengkapi tagar meta untuk mempermudah perayapan indeks Search Engine Optimization (SEO).
            </div>
          </div>

          <div className="bg-[#121110] border border-neutral-850 p-5 rounded-2xl flex flex-col gap-2.5">
            <span className="font-bold text-neutral-200 text-xs uppercase font-mono flex items-center gap-1.5 text-yellow-400">
              <HelpCircle className="h-4 w-4" />
              Petunjuk Integrasi Google Sheets
            </span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              1. Buka spreadsheet baru di Google Drive Anda.<br />
              2. Buat header baris pertama dengan kolom: <code className="text-emerald-400 font-mono">id, title, subtitle, content, category, categoryColor, imageUrl, tags, likes, views, createdAt, author</code>.<br />
              3. Salin kode skrip Apps Script Google Web App Anda.<br />
              4. Tempelkan URL tersebut ke kolom isian database di sebelah kiri dan klik simpan.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
