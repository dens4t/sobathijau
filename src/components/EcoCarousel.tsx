import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles, Droplets, Trash2, Trees, Leaf, RefreshCw } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  colorBg: string;
  illustration: React.ReactNode;
  bulletPoints: string[];
  metric: string;
  metricLabel: string;
}

export const EcoCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides: Slide[] = [
    {
      id: 1,
      tag: "KONSERVASI AIR",
      title: "Penyelamatan Mutu Air Aliran Kapuas",
      subtitle: "Menjaga keanekaragaman hayati sungai terpanjang di Indonesia melewati garis Khatulistiwa.",
      colorBg: "from-teal-900/90 to-[#1B4332]",
      metric: "68.4%",
      metricLabel: "Indeks Mutu Air",
      bulletPoints: [
        "Wajib grease trap bagi restoran sekitar aliran Kapuas.",
        "Pemantauan baku mutu inlet pabrik Siantan menggunakan IoT.",
        "Aksi penanaman pohon mangrove nipah di sempadan sungai."
      ],
      illustration: (
        <svg className="w-full h-full max-h-[160px] md:max-h-[220px]" viewBox="0 0 200 150">
          <defs>
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {/* Waves */}
          <path d="M 0,90 Q 50,70 100,90 T 200,95 L 200,150 L 0,150 Z" fill="url(#waterGrad)" />
          <path d="M 0,110 Q 40,95 90,110 T 200,115 L 200,150 L 0,150 Z" fill="#0EA5E9" opacity="0.3" id="river-wave" />
          
          {/* River boat icon */}
          <g transform="translate(45, 62)">
            <path d="M 10,12 L 50,12 L 42,22 L 18,22 Z" fill="#F59E0B" />
            <line x1="30" y1="2" x2="30" y2="12" stroke="#FFFFFF" strokeWidth="1.5" />
            <polygon points="30,2 42,6 30,10" fill="#EF4444" />
          </g>

          {/* Clouds */}
          <path d="M 20,30 Q 30,20 40,30 Q 50,22 60,30 Z" fill="#FFFFFF" opacity="0.6" />
          <path d="M 140,25 Q 150,15 160,25 Q 170,18 180,25 Z" fill="#FFFFFF" opacity="0.4" />

          {/* Floating Leaves */}
          <g transform="translate(140, 110)">
            <path d="M 0,0 Q 15,-10 30,0 Q 15,10 0,0" fill="#34D399" opacity="0.8" />
            <line x1="0" y1="0" x2="30" y2="0" stroke="#065F46" strokeWidth="0.8" />
          </g>
        </svg>
      )
    },
    {
      id: 2,
      tag: "PENGELOLAAN SAMPAH",
      title: "Gerakan Zero-Waste Sampah Rumah Tangga",
      subtitle: "Mendorong pemisahan limbah organik dan daur ulang plastik bernilai ekonomi tinggi.",
      colorBg: "from-amber-950/90 to-stone-900",
      metric: "12 Ton",
      metricLabel: "Plastik Terdaur Ulang",
      bulletPoints: [
        "Pembangunan 65 unit Bank Sampah 3R tingkat kecamatan.",
        "Inovasi komposter mandiri untuk limbah sayur basah.",
        "Hukuman pengawasan denda bagi pembuang liar pinggir jalan."
      ],
      illustration: (
        <svg className="w-full h-full max-h-[160px] md:max-h-[220px]" viewBox="0 0 200 150">
          <defs>
            <radialGradient id="trashGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#78350F" stopOpacity="0.9" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="75" r="50" fill="url(#trashGrad)" opacity="0.3" />
          
          {/* Recycling symbol */}
          <g transform="translate(80, 50)" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round">
            <path d="M 20,40 L 40,10 L 60,40 Z" strokeDasharray="3 3" />
            <path d="M 40,10 L 20,40" strokeWidth="4" />
            <path d="M 20,40 L 60,40" strokeWidth="4" />
            <path d="M 60,40 L 40,10" strokeWidth="4" />
          </g>
          
          {/* Trash bins */}
          <rect x="50" y="90" width="22" height="30" rx="3" fill="#10B981" />
          <line x1="55" y1="96" x2="55" y2="114" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="61" y1="96" x2="61" y2="114" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2 1" />
          <rect x="53" y="86" width="16" height="4" rx="1" fill="#047857" />

          <rect x="128" y="90" width="22" height="30" rx="3" fill="#EF4444" />
          <circle cx="139" cy="105" r="4" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <rect x="131" y="86" width="16" height="4" rx="1" fill="#B91C1C" />

          {/* Mini sprout */}
          <path d="M 100,120 Q 95,100 105,95 Q 115,100 100,120" fill="#34D399" />
        </svg>
      )
    },
    {
      id: 3,
      tag: "REBOISASI KOTA",
      title: "Hutan Kota & Pelindung Paru Khatulistiwa",
      subtitle: "Bekerja sama menyediakan bibit pohon rindang gratis berkualitas bagi setiap pemohon.",
      colorBg: "from-[#1B4332] to-emerald-950/95",
      metric: "+8.9K",
      metricLabel: "Bibit Pohon Tersalur",
      bulletPoints: [
        "Pemberian gratis bibit mahoni, angsana, mangga pekarangan.",
        "Peningkatan ruang terbuka hijau publik perumahan.",
        "Penyaringan CO2 udara gersang di jalur sibuk Ahmad Yani."
      ],
      illustration: (
        <svg className="w-full h-full max-h-[160px] md:max-h-[220px]" viewBox="0 0 200 150">
          <rect x="30" y="115" width="140" height="4" fill="#78350F" rx="2" />
          
          {/* Tree 1 */}
          <g transform="translate(60, 45)">
            <rect x="12" y="35" width="6" height="35" fill="#78350F" />
            <circle cx="15" cy="25" r="22" fill="#059669" />
            <circle cx="28" cy="18" r="15" fill="#10B981" opacity="0.8" />
            <circle cx="2" cy="18" r="15" fill="#34D399" opacity="0.6" />
          </g>

          {/* Tree 2 */}
          <g transform="translate(110, 60)">
            <rect x="10" y="25" width="5" height="30" fill="#78350F" />
            <polygon points="12.5,2 25,32 0,32" fill="#047857" />
            <polygon points="12.5,-6 20,18 5,18" fill="#34D399" opacity="0.9" />
          </g>

          {/* Golden Sun */}
          <circle cx="160" cy="30" r="14" fill="#F59E0B" opacity="0.45" />
          <circle cx="160" cy="30" r="8" fill="#FBBF24" />

          {/* Birds */}
          <path d="M 25,45 Q 30,40 35,45 Q 40,40 45,45" fill="none" stroke="#64748B" strokeWidth="1.2" />
          <path d="M 85,35 Q 90,30 95,35 Q 100,30 105,35" fill="none" stroke="#64748B" strokeWidth="1" />
        </svg>
      )
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[activeIndex];

  return (
    <div className="bg-white dark:bg-stone-900 border border-emerald-100 dark:border-stone-850 rounded-2xl overflow-hidden shadow-sm text-left flex flex-col" id="infografis-carousel-container">
      
      {/* Upper header */}
      <div className="px-6 py-4 border-b border-slate-50 dark:border-stone-850 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          <div>
            <h4 className="text-xs font-extrabold text-[#1B4332] dark:text-emerald-400 uppercase tracking-tight">Kanal Infografis Edukasi Lingkungan</h4>
            <p className="text-[10px] text-slate-400">Pahami draf panduan ekologis daerah bersama SobatHijau.</p>
          </div>
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? "Klik untuk pause transisi" : "Klik untuk mulai transisi otomatis"}
          className="p-1 px-2.5 rounded-lg border border-slate-100 dark:border-stone-800 bg-slate-50 dark:bg-stone-850 text-slate-500 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-amber-400 flex items-center gap-1.5 text-[9px] font-mono transition"
        >
          {isPlaying ? <Pause className="w-3 h-3 text-red-500" /> : <Play className="w-3 h-3 text-emerald-500" />}
          <span>{isPlaying ? 'PLAYING' : 'PAUSED'}</span>
        </button>
      </div>

      {/* Main viewport */}
      <div className={`relative px-6 py-8 md:p-8 bg-gradient-to-br ${currentSlide.colorBg} text-white transition-all duration-750 flex flex-col md:flex-row gap-6 items-center min-h-[300px]`}>
        
        {/* Left contents */}
        <div className="flex-1 space-y-4 w-full">
          <div>
            <span className="text-[9px] font-black tracking-widest bg-emerald-100/20 text-emerald-300 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase">
              {currentSlide.tag}
            </span>
            <h3 className="text-lg md:text-2xl font-black mt-2 tracking-tight leading-tight">
              {currentSlide.title}
            </h3>
            <p className="text-[11px] text-emerald-100/90 leading-relaxed font-normal mt-1 border-l-2 border-emerald-400/40 pl-3">
              {currentSlide.subtitle}
            </p>
          </div>

          {/* Critical points list */}
          <div className="space-y-1.5 pt-1">
            {currentSlide.bulletPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2 text-[10.5px] text-white/95">
                <Leaf className="w-3.5 h-3.5 text-emerald-300 mt-0.5 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* Mini dynamic statistics counter */}
          <div className="flex items-center gap-4 bg-emerald-950/40 border border-emerald-500/10 p-3 rounded-xl max-w-xs justify-between">
            <div className="text-left">
              <span className="text-[8px] uppercase tracking-wider text-emerald-300 block font-mono">Variabel Capaian</span>
              <span className="text-[10px] text-white/80 leading-normal">{currentSlide.metricLabel}</span>
            </div>
            <div className="text-right text-base font-black text-amber-300 font-mono">
              {currentSlide.metric}
            </div>
          </div>
        </div>

        {/* Right illustration */}
        <div className="w-full md:w-5/12 bg-white/5 dark:bg-stone-900/10 p-4 rounded-2xl border border-white/5 shadow-inner flex items-center justify-center min-h-[160px]">
          {currentSlide.illustration}
        </div>

        {/* Arrow absolute buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition border border-white/5"
          title="Geser ke kiri"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition border border-white/5"
          title="Geser ke kanan"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Pagination indicators footer */}
      <div className="px-6 py-3 border-t border-slate-50 dark:border-stone-850 bg-slate-50/50 dark:bg-stone-910 flex items-center justify-between">
        <span className="text-[9px] font-mono text-slate-400">
          Infografis {activeIndex + 1} dari {slides.length}
        </span>
        <div className="flex items-center gap-1.5">
          {slides.map((slide, slot) => (
            <button
              key={slide.id}
              onClick={() => {
                setActiveIndex(slot);
                setIsPlaying(false); // Stop autoplay when specifically clicked
              }}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activeIndex === slot ? 'w-6 bg-[#1B4332] dark:bg-emerald-500' : 'w-2 bg-slate-300 dark:bg-stone-700'
              }`}
              title={`Buka slides ${slot + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
