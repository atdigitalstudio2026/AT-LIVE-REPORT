import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Flame, 
  Plus, 
  Sparkles,
  Clock,
  Palette,
  Radio,
  Zap,
  CheckCircle2
} from 'lucide-react';

type ColorTheme = 'violet' | 'orange' | 'cyan' | 'emerald';
type DisplayMode = 'countdown' | 'realtime';

interface ThemeConfig {
  name: string;
  badgeBg: string;
  badgeText: string;
  activeColor: string;
  coreColor: string;
  primaryGlow: string;
  deepHalo: string;
  unlitColor: string;
  acrylicBorder: string;
  acrylicGlow: string;
  beamColor: string;
  ringBorder: string;
  lensColor: string;
}

const THEMES: Record<ColorTheme, ThemeConfig> = {
  violet: {
    name: 'Cyber Violet (Foto Asli)',
    badgeBg: 'bg-purple-950/80',
    badgeText: 'text-purple-300',
    activeColor: '#d8b4fe',
    coreColor: '#ffffff',
    primaryGlow: '#c084fc',
    deepHalo: '#9333ea',
    unlitColor: 'rgba(147, 51, 234, 0.1)',
    acrylicBorder: 'rgba(192, 132, 252, 0.65)',
    acrylicGlow: '0 0 25px rgba(168, 85, 247, 0.45), inset 0 0 20px rgba(192, 132, 252, 0.2)',
    beamColor: 'rgba(168, 85, 247, 0.75)',
    ringBorder: 'rgba(192, 132, 252, 0.6)',
    lensColor: '#c084fc',
  },
  orange: {
    name: 'Shopee Cyber Orange',
    badgeBg: 'bg-orange-950/80',
    badgeText: 'text-orange-400',
    activeColor: '#ffedd5',
    coreColor: '#ffffff',
    primaryGlow: '#fb923c',
    deepHalo: '#ee4d2d',
    unlitColor: 'rgba(238, 77, 45, 0.1)',
    acrylicBorder: 'rgba(251, 146, 60, 0.65)',
    acrylicGlow: '0 0 25px rgba(238, 77, 45, 0.45), inset 0 0 20px rgba(251, 146, 60, 0.2)',
    beamColor: 'rgba(238, 77, 45, 0.75)',
    ringBorder: 'rgba(251, 146, 60, 0.6)',
    lensColor: '#fb923c',
  },
  cyan: {
    name: 'Cyberpunk Cyan',
    badgeBg: 'bg-cyan-950/80',
    badgeText: 'text-cyan-300',
    activeColor: '#e0f2fe',
    coreColor: '#ffffff',
    primaryGlow: '#38bdf8',
    deepHalo: '#0284c7',
    unlitColor: 'rgba(6, 182, 212, 0.1)',
    acrylicBorder: 'rgba(56, 189, 248, 0.65)',
    acrylicGlow: '0 0 25px rgba(14, 165, 233, 0.45), inset 0 0 20px rgba(56, 189, 248, 0.2)',
    beamColor: 'rgba(14, 165, 233, 0.75)',
    ringBorder: 'rgba(56, 189, 248, 0.6)',
    lensColor: '#38bdf8',
  },
  emerald: {
    name: 'Matrix Emerald',
    badgeBg: 'bg-emerald-950/80',
    badgeText: 'text-emerald-300',
    activeColor: '#d1fae5',
    coreColor: '#ffffff',
    primaryGlow: '#34d399',
    deepHalo: '#059669',
    unlitColor: 'rgba(16, 185, 129, 0.1)',
    acrylicBorder: 'rgba(52, 211, 153, 0.65)',
    acrylicGlow: '0 0 25px rgba(16, 185, 129, 0.45), inset 0 0 20px rgba(52, 211, 153, 0.2)',
    beamColor: 'rgba(16, 185, 129, 0.75)',
    ringBorder: 'rgba(52, 211, 153, 0.6)',
    lensColor: '#34d399',
  }
};

// 7-Segment SVG Digit Generator with accurate beveled segments
interface SevenSegmentProps {
  digit: number;
  theme: ThemeConfig;
  isUrgent?: boolean;
}

const SEGMENT_MAP: Record<number, Record<string, boolean>> = {
  0: { a: true, b: true, c: true, d: true, e: true, f: true, g: false },
  1: { a: false, b: true, c: true, d: false, e: false, f: false, g: false },
  2: { a: true, b: true, c: false, d: true, e: true, f: false, g: true },
  3: { a: true, b: true, c: true, d: true, e: false, f: false, g: true },
  4: { a: false, b: true, c: true, d: false, e: false, f: true, g: true },
  5: { a: true, b: false, c: true, d: true, e: false, f: true, g: true },
  6: { a: true, b: false, c: true, d: true, e: true, f: true, g: true },
  7: { a: true, b: true, c: true, d: false, e: false, f: false, g: false },
  8: { a: true, b: true, c: true, d: true, e: true, f: true, g: true },
  9: { a: true, b: true, c: true, d: true, e: false, f: true, g: true },
};

const SevenSegmentDigit: React.FC<SevenSegmentProps> = ({ digit, theme, isUrgent }) => {
  const activeSegments = SEGMENT_MAP[Math.min(9, Math.max(0, digit))] || SEGMENT_MAP[0];

  const litFill = isUrgent ? '#ef4444' : theme.activeColor;
  const unlitFill = theme.unlitColor;

  return (
    <div className="relative inline-block w-12 sm:w-20 md:w-24 lg:w-28 h-20 sm:h-32 md:h-40 lg:h-44">
      <svg 
        viewBox="0 0 54 90" 
        className="w-full h-full drop-shadow-sm"
        style={{
          filter: isUrgent 
            ? 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.9))' 
            : `drop-shadow(0 0 10px ${theme.primaryGlow}) drop-shadow(0 0 25px ${theme.deepHalo})`
        }}
      >
        <defs>
          <filter id={`glow-${theme.name}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Segment a (Top Horizontal) */}
        <polygon 
          points="10,8 44,8 38,15 16,15" 
          fill={activeSegments.a ? litFill : unlitFill} 
          filter={activeSegments.a ? `url(#glow-${theme.name})` : undefined}
        />

        {/* Segment b (Top-Right Vertical) */}
        <polygon 
          points="46,10 46,42 39,37 39,17" 
          fill={activeSegments.b ? litFill : unlitFill} 
          filter={activeSegments.b ? `url(#glow-${theme.name})` : undefined}
        />

        {/* Segment c (Bottom-Right Vertical) */}
        <polygon 
          points="46,48 46,80 39,73 39,53" 
          fill={activeSegments.c ? litFill : unlitFill} 
          filter={activeSegments.c ? `url(#glow-${theme.name})` : undefined}
        />

        {/* Segment d (Bottom Horizontal) */}
        <polygon 
          points="10,82 44,82 38,75 16,75" 
          fill={activeSegments.d ? litFill : unlitFill} 
          filter={activeSegments.d ? `url(#glow-${theme.name})` : undefined}
        />

        {/* Segment e (Bottom-Left Vertical) */}
        <polygon 
          points="8,48 15,53 15,73 8,80" 
          fill={activeSegments.e ? litFill : unlitFill} 
          filter={activeSegments.e ? `url(#glow-${theme.name})` : undefined}
        />

        {/* Segment f (Top-Left Vertical) */}
        <polygon 
          points="8,10 15,17 15,37 8,42" 
          fill={activeSegments.f ? litFill : unlitFill} 
          filter={activeSegments.f ? `url(#glow-${theme.name})` : undefined}
        />

        {/* Segment g (Middle Horizontal) */}
        <polygon 
          points="12,45 16,41 38,41 42,45 38,49 16,49" 
          fill={activeSegments.g ? litFill : unlitFill} 
          filter={activeSegments.g ? `url(#glow-${theme.name})` : undefined}
        />
      </svg>
    </div>
  );
};

export const VoucherCountdownTimer: React.FC = () => {
  // Preset default 10 minutes (600 seconds)
  const [totalSeconds, setTotalSeconds] = useState(10 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(10 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [voucherTitle, setVoucherTitle] = useState('FLASH VOUCHER DISKON SPESIAL LIVE');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [colorTheme, setColorTheme] = useState<ColorTheme>('violet');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('countdown');

  // Real-time clock states
  const [realTimeHours, setRealTimeHours] = useState(23);
  const [realTimeMinutes, setRealTimeMinutes] = useState(45);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<any>(null);

  const theme = THEMES[colorTheme];

  // Update real-time clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setRealTimeHours(now.getHours());
      setRealTimeMinutes(now.getMinutes());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Audio tone generator (Futuristic Sci-Fi chime)
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Holographic sci-fi ascending chime
      [587.33, 880, 1174.66, 1760].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.38);
      });
    } catch (e) {
      console.log('Audio alert fallback', e);
    }
  };

  // Timer loop
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsRunning(false);
            playAlertSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isRunning, remainingSeconds]);

  // Set preset
  const setPresetMinutes = (minutes: number) => {
    const sec = minutes * 60;
    setTotalSeconds(sec);
    setRemainingSeconds(sec);
    setIsRunning(false);
    setDisplayMode('countdown');
  };

  // Add more seconds on the fly
  const addSeconds = (sec: number) => {
    setRemainingSeconds(prev => prev + sec);
    setTotalSeconds(prev => Math.max(prev, remainingSeconds + sec));
    setDisplayMode('countdown');
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Listen to escape / fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isFinished = displayMode === 'countdown' && remainingSeconds === 0;
  const isUrgent = displayMode === 'countdown' && remainingSeconds > 0 && remainingSeconds <= 60;

  // Digits to display
  let d1 = 0, d2 = 0, d3 = 0, d4 = 0;
  if (displayMode === 'realtime') {
    d1 = Math.floor(realTimeHours / 10);
    d2 = realTimeHours % 10;
    d3 = Math.floor(realTimeMinutes / 10);
    d4 = realTimeMinutes % 10;
  } else {
    d1 = Math.floor(minutes / 10);
    d2 = minutes % 10;
    d3 = Math.floor(seconds / 10);
    d4 = seconds % 10;
  }

  // Progress percentage for countdown
  const progressPercent = totalSeconds > 0 
    ? Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100)) 
    : 0;

  return (
    <div 
      ref={containerRef}
      className={`space-y-6 pb-12 transition-all ${
        isFullscreen 
          ? 'p-4 sm:p-8 bg-[#07040d] min-h-screen flex flex-col justify-center items-center' 
          : ''
      }`}
    >
      {/* Top Banner (hidden in fullscreen for pure immersive studio display) */}
      {!isFullscreen && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Holographic 3D Digital Timer
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border flex items-center gap-1 ${theme.badgeBg} ${theme.badgeText} border-purple-800/40`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Futuristic Live Studio</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Display akrilik transparan futuristik berbasis holographic projector untuk pemicu konversi & FOMO di meja siaran.
            </p>
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Display Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setDisplayMode('countdown')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  displayMode === 'countdown' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>Timer Voucher</span>
              </button>
              <button
                onClick={() => setDisplayMode('realtime')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  displayMode === 'realtime' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                <span>Jam Studio ({String(realTimeHours).padStart(2, '0')}:{String(realTimeMinutes).padStart(2, '0')})</span>
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                soundEnabled 
                  ? 'bg-purple-50 border-purple-200 text-purple-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
              title={soundEnabled ? 'Alarm Suara Aktif' : 'Alarm Hening'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Full Screen Mode Meja Siaran"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Full Screen</span>
            </button>
          </div>
        </div>
      )}

      {/* FUTURISTIC HOLOGRAPHIC ACRYLIC DISPLAY CHASSIS */}
      <div 
        className={`w-full max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 transition-all relative overflow-hidden flex flex-col items-center justify-center ${
          isFullscreen ? 'max-w-5xl shadow-2xl my-auto' : ''
        }`}
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #150a24 0%, #0a0413 60%, #040108 100%)',
          boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.9), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
          border: '1px solid #231238'
        }}
      >
        {/* Ambient Room Lighting Background Glow */}
        <div 
          className="absolute top-1/4 w-[500px] h-[350px] rounded-full pointer-events-none opacity-30 blur-3xl"
          style={{ background: `radial-gradient(circle, ${theme.primaryGlow} 0%, transparent 70%)` }}
        />

        {/* Top Floating Promo Status Bar */}
        <div className="w-full flex items-center justify-between mb-6 relative z-20 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: theme.primaryGlow }} />
            <input
              type="text"
              value={voucherTitle}
              onChange={(e) => setVoucherTitle(e.target.value)}
              placeholder="Judul Voucher..."
              className="bg-transparent font-black tracking-wider text-purple-200 uppercase focus:outline-none focus:border-b focus:border-purple-400 w-64 sm:w-80 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText} border border-purple-500/30`}>
              {displayMode === 'realtime' 
                ? '🕒 LIVE STUDIO CLOCK' 
                : isFinished 
                ? '⚠️ VOUCHER EXPIRED' 
                : isRunning 
                ? '⚡ FLASH SALE RUNNING' 
                : '⏸️ STANDBY'}
            </span>

            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Keluar Fullscreen"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 1. FLOATING TRANSPARENT ACRYLIC DISPLAY PANEL (Matching Photo) */}
        <div className="relative z-20 my-2 sm:my-4 transition-all">
          <div 
            className="rounded-3xl p-6 sm:p-10 md:p-12 relative flex items-center justify-center backdrop-blur-md transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: `2.5px solid ${theme.acrylicBorder}`,
              boxShadow: theme.acrylicGlow,
              minWidth: '280px',
            }}
          >
            {/* Subtle Acrylic Bevel Edge Reflection Highlight */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none border border-white/20" />
            <div className="absolute top-2 left-4 right-4 h-1 rounded-full bg-white/20 blur-[1px] pointer-events-none" />

            {/* Acrylic Hardware Corner Screws / Alignment Marks */}
            <div className="absolute top-3 left-4 w-1.5 h-1.5 rounded-full bg-white/40" />
            <div className="absolute top-3 right-4 w-1.5 h-1.5 rounded-full bg-white/40" />
            <div className="absolute bottom-3 left-4 w-1.5 h-1.5 rounded-full bg-white/40" />
            <div className="absolute bottom-3 right-4 w-1.5 h-1.5 rounded-full bg-white/40" />

            {/* Micro Tech Branding Text on bottom right corner */}
            <span className="absolute bottom-2.5 right-6 text-[8px] font-mono tracking-widest text-purple-300/40 select-none">
              HOLO-VOUCHER • V.26
            </span>

            {/* 7-Segment LED Digits Container */}
            <div className="flex items-center justify-center gap-1 sm:gap-3 md:gap-4">
              {/* Digit 1 */}
              <SevenSegmentDigit digit={d1} theme={theme} isUrgent={isUrgent} />

              {/* Digit 2 */}
              <SevenSegmentDigit digit={d2} theme={theme} isUrgent={isUrgent} />

              {/* Blinking Glowing Colon Separator */}
              <div className="flex flex-col justify-center items-center gap-3 sm:gap-6 px-1 sm:px-2">
                <span 
                  className={`w-2.5 sm:w-4 md:w-5 h-2.5 sm:h-4 md:h-5 rounded-sm transition-all ${
                    isRunning || displayMode === 'realtime' ? 'animate-pulse' : ''
                  }`}
                  style={{
                    backgroundColor: isUrgent ? '#ef4444' : theme.activeColor,
                    boxShadow: `0 0 15px ${theme.primaryGlow}, 0 0 30px ${theme.deepHalo}`
                  }}
                />
                <span 
                  className={`w-2.5 sm:w-4 md:w-5 h-2.5 sm:h-4 md:h-5 rounded-sm transition-all ${
                    isRunning || displayMode === 'realtime' ? 'animate-pulse' : ''
                  }`}
                  style={{
                    backgroundColor: isUrgent ? '#ef4444' : theme.activeColor,
                    boxShadow: `0 0 15px ${theme.primaryGlow}, 0 0 30px ${theme.deepHalo}`
                  }}
                />
              </div>

              {/* Digit 3 */}
              <SevenSegmentDigit digit={d3} theme={theme} isUrgent={isUrgent} />

              {/* Digit 4 */}
              <SevenSegmentDigit digit={d4} theme={theme} isUrgent={isUrgent} />
            </div>
          </div>
        </div>

        {/* 2. HOLOGRAPHIC LASER PROJECTOR BEAMS (Rays of Light emanating upward) */}
        <div className="w-64 sm:w-80 md:w-96 h-20 sm:h-28 relative -my-2 sm:-my-4 pointer-events-none z-10 overflow-visible flex justify-center">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="beamGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={theme.beamColor} stopOpacity="0.85" />
                <stop offset="60%" stopColor={theme.beamColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={theme.beamColor} stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Fan of Light Rays Cone */}
            <polygon points="120,118 280,118 385,0 15,0" fill="url(#beamGradient)" opacity="0.35" />

            {/* Laser Beam Lines */}
            <line x1="140" y1="118" x2="50" y2="0" stroke={theme.primaryGlow} strokeWidth="1.5" opacity="0.5" strokeDasharray="6 3" />
            <line x1="165" y1="118" x2="110" y2="0" stroke={theme.coreColor} strokeWidth="2" opacity="0.75" />
            <line x1="185" y1="118" x2="160" y2="0" stroke={theme.coreColor} strokeWidth="2.5" opacity="0.85" />
            <line x1="200" y1="118" x2="200" y2="0" stroke={theme.coreColor} strokeWidth="3" opacity="0.9" />
            <line x1="215" y1="118" x2="240" y2="0" stroke={theme.coreColor} strokeWidth="2.5" opacity="0.85" />
            <line x1="235" y1="118" x2="290" y2="0" stroke={theme.coreColor} strokeWidth="2" opacity="0.75" />
            <line x1="260" y1="118" x2="350" y2="0" stroke={theme.primaryGlow} strokeWidth="1.5" opacity="0.5" strokeDasharray="6 3" />
          </svg>
        </div>

        {/* 3. CYLINDRICAL METALLIC / CHROME PROJECTOR BASE (Matching Photo) */}
        <div className="relative z-10 flex flex-col items-center">
          
          {/* Top Projector Emitter Ellipse with Concentric Light Rings */}
          <div 
            className="w-56 sm:w-72 md:w-80 h-14 sm:h-18 rounded-[50%] flex items-center justify-center -mb-7 relative z-20 border-2 transition-all"
            style={{
              background: 'radial-gradient(ellipse at center, #240f3b 0%, #110620 70%, #080210 100%)',
              borderColor: theme.ringBorder,
              boxShadow: `0 0 35px ${theme.primaryGlow}, inset 0 0 15px ${theme.primaryGlow}`
            }}
          >
            {/* Concentric Circle 1 */}
            <div 
              className="w-4/5 h-4/5 rounded-[50%] border flex items-center justify-center"
              style={{ borderColor: `${theme.primaryGlow}80` }}
            >
              {/* Concentric Circle 2 */}
              <div 
                className="w-3/5 h-3/5 rounded-[50%] border flex items-center justify-center"
                style={{ borderColor: `${theme.primaryGlow}99` }}
              >
                {/* Center Core Emitter Lens */}
                <div 
                  className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-[50%] shadow-lg animate-pulse"
                  style={{
                    backgroundColor: theme.coreColor,
                    boxShadow: `0 0 20px ${theme.primaryGlow}, 0 0 40px ${theme.deepHalo}`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Chrome Cylinder Body with Metallic Specular Highlights */}
          <div 
            className="w-56 sm:w-72 md:w-80 h-16 sm:h-20 rounded-b-3xl relative z-10 transition-all"
            style={{
              background: 'linear-gradient(90deg, #090514 0%, #1e1136 15%, #3c1e63 32%, #180c2e 50%, #4f2882 72%, #0f0720 100%)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.95), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Bottom Glowing Rim Ring */}
            <div 
              className="absolute -bottom-1 inset-x-3 h-2 rounded-full transition-all"
              style={{
                backgroundColor: theme.primaryGlow,
                boxShadow: `0 0 20px ${theme.primaryGlow}, 0 4px 25px ${theme.deepHalo}`
              }}
            />
          </div>

          {/* Marble Desk Surface Reflection Glow */}
          <div 
            className="w-64 sm:w-88 h-10 -mt-3 rounded-full blur-xl pointer-events-none opacity-50 transition-all"
            style={{
              background: `radial-gradient(ellipse at center, ${theme.primaryGlow} 0%, transparent 70%)`
            }}
          />
        </div>

        {/* 4. COUNTDOWN PROGRESS BAR (If in countdown mode) */}
        {displayMode === 'countdown' && (
          <div className="w-full max-w-lg mt-6 bg-slate-900/80 h-2.5 rounded-full p-0.5 border border-purple-900/60 relative z-20">
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progressPercent}%`,
                background: isUrgent 
                  ? 'linear-gradient(90deg, #ef4444, #dc2626)' 
                  : `linear-gradient(90deg, ${theme.primaryGlow}, ${theme.deepHalo})`,
                boxShadow: `0 0 12px ${theme.primaryGlow}`
              }}
            />
          </div>
        )}

        {/* 5. INTERACTIVE HARDWARE CONTROLS (Play, Pause, Reset, Add Time) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8 relative z-20">
          {displayMode === 'countdown' ? (
            <>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                    : 'text-white shadow-purple-500/30'
                }`}
                style={{
                  background: isRunning ? undefined : `linear-gradient(135deg, ${theme.primaryGlow}, ${theme.deepHalo})`
                }}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isRunning ? 'Jeda Countdown' : 'Mulai Hitung Mundur'}</span>
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setRemainingSeconds(totalSeconds);
                }}
                className="p-3 rounded-2xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-800/50 transition-colors cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => addSeconds(60)}
                className="px-3.5 py-3 rounded-2xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-800/50 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>1 Menit</span>
              </button>

              <button
                onClick={() => addSeconds(300)}
                className="px-3.5 py-3 rounded-2xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-800/50 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>5 Menit</span>
              </button>
            </>
          ) : (
            <div className="px-5 py-2.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs font-semibold text-purple-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Jam Studio Real-Time Berjalan Mengikuti Waktu Lokal</span>
            </div>
          )}
        </div>

      </div>

      {/* QUICK PRESETS & COLOR THEMES (Visible outside fullscreen) */}
      {!isFullscreen && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-600" />
                <span>Kustomisasi Warna Hologram & Preset Durasi Voucher</span>
              </h2>
              <p className="text-xs text-slate-500">
                Ubah pendaran neon akrilik dan pilih durasi kilat voucher untuk sesi live streaming Shopee.
              </p>
            </div>

            {/* Color Theme Selector */}
            <div className="flex items-center gap-2">
              {(Object.keys(THEMES) as ColorTheme[]).map(thKey => (
                <button
                  key={thKey}
                  onClick={() => setColorTheme(thKey)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    colorTheme === thKey ? 'scale-125 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: THEMES[thKey].primaryGlow,
                    borderColor: '#ffffff'
                  }}
                  title={THEMES[thKey].name}
                />
              ))}
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { label: 'Flash Sale (3 Menit)', min: 3 },
              { label: 'Voucher Kilat (5 Menit)', min: 5 },
              { label: 'Voucher Toko (10 Menit)', min: 10 },
              { label: 'Peak Hour (15 Menit)', min: 15 },
              { label: 'Sesi Penuh (30 Menit)', min: 30 },
            ].map(preset => (
              <button
                key={preset.min}
                onClick={() => setPresetMinutes(preset.min)}
                className={`p-3 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  displayMode === 'countdown' && totalSeconds === preset.min * 60
                    ? 'bg-purple-50 border-purple-300 text-purple-800 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span>{preset.min} MENIT</span>
                <span className="text-[10px] text-slate-400 font-normal">{preset.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
