/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, Zap, MessageSquare, Sparkles, 
  AlertCircle, CheckCircle, Wand2, PlayCircle, 
  Loader2, Music, Download, Upload, Image as ImageIcon, Film, XCircle,
  Settings, Save, Key, ExternalLink, HelpCircle, ChevronDown, ChevronUp,
  Copy, Check, Play, Pause, Clock, History, Trash2, ShieldCheck
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * BANG DIGITAL VOICE - Text To Speech Application
 * Version: 1.2 (SDK Integrated)
 * Compliance: Strict Adherence to PRD v1.0
 */

// --- Constants & Configuration ---
const GEMINI_VOICES = [
  { name: 'Kore', label: 'Kore (Female, Balanced)' },
  { name: 'Fenrir', label: 'Fenrir (Male, Deep)' },
  { name: 'Puck', label: 'Puck (Male, Energetic)' },
  { name: 'Aoede', label: 'Aoede (Female, Soft)' },
  { name: 'Charon', label: 'Charon (Male, Deep)' },
  { name: 'Zephyr', label: 'Zephyr (Male, Smooth)' },
];

const GEMINI_STYLES = [
  "Gaya jualan antusias & ceria",
  "Storytelling santai (A day in my life)",
  "Hard selling (Promo diskon terbatas)",
  "Soft selling (Review jujur/racun TikTok)"
];

const LOCAL_LANGUAGES = [
  { id: 'id', label: 'Indonesia Baku' },
  { id: 'jv', label: 'Jawa (Medok)' },
  { id: 'su', label: 'Sunda' },
  { id: 'bt', label: 'Betawi / Jakarta' },
  { id: 'mn', label: 'Medan / Batak' },
  { id: 'bl', label: 'Bali' },
  { id: 'mk', label: 'Makassar' },
  { id: 'pl', label: 'Palembang' },
  { id: 'md', label: 'Manado' },
  { id: 'ac', label: 'Aceh' },
  { id: 'pd', label: 'Padang (Minang)' },
  { id: 'pt', label: 'Pontianak' },
  { id: 'bj', label: 'Banjarmasin' },
];

const VIRAL_FORMULAS = [
  { label: 'Problem-Solution', text: 'Lagi pusing karena [Masalah]? Tenang, ini solusinya! Kenalin nih [Nama Produk] yang bisa bikin [Manfaat]. Buruan klik keranjang kuning sebelum kehabisan!' },
  { label: 'Unboxing', text: 'Gak nyangka banget isinya bakal se-keren ini! Mari kita unboxing [Nama Produk]. Liat deh detailnya, parah sih ini worth it banget. Cek keranjang kuning sekarang!' },
  { label: 'Flash Sale', text: 'Cuma hari ini! Diskon gede-gedean buat [Nama Produk]. Kapan lagi dapet harga segini murah? Langsung aja checkout di keranjang kuning sekarang juga!' }
];

const MEDIA_MAX_DIMENSION = 1600;
const MEDIA_IMAGE_QUALITY = 0.85;

const CustomPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
      setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full bg-neutral-950 p-4 rounded-2xl border border-white/5 shadow-inner">
      <audio ref={audioRef} src={src} className="hidden" />
      <div className="flex items-center gap-4">
        <button 
          onClick={togglePlay} 
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all shadow-lg ${
            isPlaying ? 'bg-neutral-800 text-lime-500 ring-2 ring-lime-500/20' : 'bg-lime-500 text-neutral-900 hover:scale-105 active:scale-95'
          }`}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </button>
        
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-mono text-lime-500/70 tracking-tighter">{formatTime(currentTime)}</span>
            <span className="text-[10px] font-mono text-neutral-600 tracking-tighter">{formatTime(duration)}</span>
          </div>
          <div className="h-6 flex items-center gap-[2px] sm:gap-1">
            {[...Array(40)].map((_, i) => {
              const isActive = i < (progress / 100) * 40;
              const height = 30 + Math.sin(i * 0.8) * 20 + (i % 3) * 10;
              return (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-all duration-300 ${isActive ? 'bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.4)]' : 'bg-neutral-800'}`}
                  style={{ height: `${Math.min(100, height)}%`, minHeight: '3px' }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  // --- State Management ---
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoWriting, setAutoWriting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [mediaPreview, setMediaPreview] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
  const [sources, setSources] = useState<{ title: string, uri: string }[]>([]);
  const [localLanguage, setLocalLanguage] = useState('id');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [activeKeyIndex, setActiveKeyIndex] = useState(0);
  const [exhaustedKeys, setExhaustedKeys] = useState<Record<number, number>>({}); // index -> timestamp
  const [cooldown, setCooldown] = useState(0);
  const [userApiKey, setUserApiKey] = useState(localStorage.getItem('user_gemini_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  // New States for Smart Features
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ id: string, text: string, url: string, voice: string, date: Date }[]>([]);
  const [previewingVoice, setPreviewingVoice] = useState(false);
  const [voicePreviews, setVoicePreviews] = useState<Record<string, string>>({});
  const [lastMediaData, setLastMediaData] = useState<{ base64: string, mimeType: string } | null>(null);
  
  // Config States
  const [geminiVoice, setGeminiVoice] = useState('Kore');
  const [styleInstruction, setStyleInstruction] = useState('');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (alert.message) {
      const timer = setTimeout(() => setAlert({ type: '', message: '' }), 5000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [alert]);

  // --- Handlers ---

  const saveUserKey = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem('user_gemini_key', key);
    setAlert({ 
      type: 'success', 
      message: 'API Key berhasil disimpan! Sekarang aktif untuk semua fitur: Tulis Script, Analisa Media, dan Voice Over.' 
    });
    setShowSettings(false);
  };

  const handleCheckApiKey = async () => {
    if (!userApiKey) {
      setAlert({ type: 'error', message: 'Harap masukkan API Key terlebih dahulu.' });
      return;
    }
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: userApiKey });
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ parts: [{ text: "hi" }] }],
        config: { maxOutputTokens: 1 }
      });
      setAlert({ type: 'success', message: 'API Key valid dan siap digunakan!' });
    } catch (err: any) {
      console.error(err);
      setAlert({ type: 'error', message: 'API Key tidak valid atau bermasalah. Periksa kembali.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetApiKey = () => {
    setUserApiKey('');
    localStorage.removeItem('user_gemini_key');
    setAlert({ type: 'success', message: 'API Key berhasil dihapus secara bersih.' });
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handlePreviewVoice = async () => {
    if (voicePreviews[geminiVoice]) {
      const audio = new Audio(voicePreviews[geminiVoice]);
      audio.play();
      return;
    }
    
    setPreviewingVoice(true);
    try {
      const response = await executeWithRetry((ai) => 
        ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: `Halo, saya ${geminiVoice}, siap membantu promosi Anda.` }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: geminiVoice }
              }
            }
          }
        })
      );
      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const wavUrl = pcmBase64ToWavUrl(audioData, 24000);
        setVoicePreviews(prev => ({ ...prev, [geminiVoice]: wavUrl }));
        const audio = new Audio(wavUrl);
        audio.play();
      }
    } catch (err) {
      console.error("Preview failed", err);
      setAlert({ type: 'error', message: 'Gagal memutar preview suara.' });
    } finally {
      setPreviewingVoice(false);
    }
  };

  const executeWithRetry = async (operation: (ai: any) => Promise<any>) => {
    // 1. Prioritaskan User API Key jika tersedia
    if (userApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: userApiKey });
        return await operation(ai);
      } catch (err: any) {
        // Jika error 401/403 (Invalid Key), beritahu user
        if (err.message?.includes('401') || err.message?.includes('403')) {
          throw new Error("API Key Anda tidak valid. Periksa kembali di Pengaturan.");
        }
        // Jika rate limit pada key user, beri tahu
        if (err.message?.includes('429')) {
          const keyHint = userApiKey ? `(${userApiKey.substring(0, 4)}...${userApiKey.slice(-4)})` : '';
          throw new Error(`API Key ${keyHint} mencapai batas kuota (429). Tunggu 1 menit atau gunakan kunci lain.`);
        }
        throw err;
      }
    }

    // 2. Fallback ke Pool Publik (Rotasi)
    const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    const keys = keysStr.split(',').map(k => k.trim()).filter(Boolean);
    
    if (keys.length === 0) {
      throw new Error("API Key tidak ditemukan. Harap konfigurasi di Secrets.");
    }

    let lastError: any = null;
    const now = Date.now();

    // Filter kunci yang tidak sedang dalam "penalti"
    const availableIndices = keys.map((_, i) => i).filter(i => {
      const penaltyUntil = exhaustedKeys[i] || 0;
      return now > penaltyUntil;
    });

    if (availableIndices.length === 0) {
      throw new Error("Semua API Key sedang sibuk (Limit Tercapai). Silakan coba lagi dalam 1 menit.");
    }

    // Coba maksimal 3 kunci yang tersedia
    const maxAttempts = Math.min(availableIndices.length, 3);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Pilih index dari daftar yang tersedia secara berurutan
      const targetIdx = availableIndices[(activeKeyIndex + attempt) % availableIndices.length];
      const key = keys[targetIdx];
      const ai = new GoogleGenAI({ apiKey: key });

      try {
        const result = await operation(ai);
        setActiveKeyIndex((targetIdx + 1) % keys.length);
        return result;
      } catch (err: any) {
        lastError = err;
        const isRateLimit = err.message?.includes('429') || err.message?.includes('quota');
        
        if (isRateLimit) {
          // Masukkan ke kotak penalti selama 60 detik
          setExhaustedKeys(prev => ({ ...prev, [targetIdx]: Date.now() + 60000 }));
          console.warn(`Key slot ${targetIdx + 1} limit. Masuk kotak penalti 60 detik.`);
          if (attempt < maxAttempts - 1) continue;
        }
        
        throw err;
      }
    }
    throw lastError;
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleAutoWrite = async () => {
    if (autoWriting) return;

    setAutoWriting(true);
    setAlert({ type: '', message: '' });
    setSources([]);

    try {
      const selectedLang = LOCAL_LANGUAGES.find(l => l.id === localLanguage)?.label || 'Indonesia Baku';
      const stylePart = styleInstruction ? ` Gunakan gaya instruksi tambahan: ${styleInstruction}.` : '';
      const prompt = `Berperanlah sebagai konten kreator TikTok Affiliate yang handal. Cari tren produk yang sedang viral saat ini menggunakan Google Search. Buatkan skrip voice over promosi produk tersebut yang singkat (3-4 kalimat). Gunakan gaya bahasa: ${selectedLang}.${stylePart} Sertakan informasi harga atau promo terbaru jika ditemukan. Gunakan formula: Hook yang bikin penasaran, sebutkan 1 keunggulan utama produk, dan diakhiri dengan Call to Action (ajakan klik keranjang kuning/join live). Langsung berikan teksnya saja.`;
      
      const response = await executeWithRetry((ai) => 
        ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            tools: [{ googleSearch: {} }]
          }
        })
      );
      
      const generatedText = response.text || "Halo, ini adalah teks contoh dari BANG DIGITAL VOICE.";
      setText(generatedText.trim());

      // Extract sources
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const extractedSources = chunks
          .filter(chunk => chunk.web)
          .map(chunk => ({ title: chunk.web!.title || 'Source', uri: chunk.web!.uri }));
        setSources(extractedSources);
      }
      
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Gagal membuat teks otomatis.' });
    } finally {
      setAutoWriting(false);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const getScaledDimensions = (width: number, height: number, maxDimension: number) => {
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    return {
      width: Math.max(1, Math.round(width * scale)),
      height: Math.max(1, Math.round(height * scale))
    };
  };

  const prepareImageForGemini = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        const { width, height } = getScaledDimensions(image.naturalWidth, image.naturalHeight, MEDIA_MAX_DIMENSION);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Gagal memproses gambar. Coba file lain."));
          return;
        }

        ctx.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', MEDIA_IMAGE_QUALITY);
        URL.revokeObjectURL(objectUrl);

        resolve({
          base64: dataUrl.split(',')[1],
          mimeType: 'image/jpeg'
        });
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("File gambar tidak bisa dibaca. Gunakan JPG/PNG/WebP."));
      };

      image.src = objectUrl;
    });
  };

  const extractVideoFrame = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.crossOrigin = 'anonymous';

      video.onloadeddata = () => {
        // Ambil frame di detik ke-1 atau pertengahan video
        video.currentTime = Math.min(1, video.duration / 2 || 0);
      };

      video.onseeked = () => {
        const { width, height } = getScaledDimensions(video.videoWidth, video.videoHeight, MEDIA_MAX_DIMENSION);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve({
            base64: dataUrl.split(',')[1],
            mimeType: 'image/jpeg'
          });
        } else {
          reject(new Error("Gagal mendapatkan context canvas."));
        }
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => reject(new Error("Gagal memuat video untuk dianalisis."));
    });
  };

  const analyzeWithGemini = async (base64Data: string, mimeType: string) => {
    const selectedLang = LOCAL_LANGUAGES.find(l => l.id === localLanguage)?.label || 'Indonesia Baku';
    const stylePart = styleInstruction ? ` Gunakan gaya instruksi tambahan: ${styleInstruction}.` : '';
    const prompt = `Berperanlah sebagai konten kreator TikTok Affiliate. Analisa produk atau situasi dalam media ini. Gunakan Google Search untuk mencari informasi tambahan seperti harga pasaran, keunggulan kompetitif, atau ulasan populer tentang produk serupa. Lalu buatkan skrip voice over promosi pendek (3-4 kalimat). Gunakan gaya bahasa: ${selectedLang}.${stylePart} Gunakan formula: Hook yang relevan dengan gambar/video, Keunggulan produk yang divalidasi data search, dan Call to Action (klik keranjang kuning). Langsung berikan teksnya saja tanpa tanda kutip.`;

    try {
      setSources([]);
      const response = await executeWithRetry((ai) => 
        ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: mimeType, data: base64Data } }
            ]
          }],
          config: {
            tools: [{ googleSearch: {} }]
          }
        })
      );

      const generatedText = response.text || "Maaf, saya tidak dapat menganalisa media ini.";
      setText(generatedText.trim());

      // Extract sources
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const extractedSources = chunks
          .filter(chunk => chunk.web)
          .map(chunk => ({ title: chunk.web!.title || 'Source', uri: chunk.web!.uri }));
        setSources(extractedSources);
      }

      setAlert({ type: 'success', message: 'Skrip berhasil dibuat dengan data real-time!' });
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || "Gagal menganalisa media dengan Gemini.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAlert({ type: '', message: '' });
    setAutoWriting(true);

    try {
      let base64Data = "";
      let mimeType = "image/jpeg";
      
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview({ url: previewUrl, type: file.type.startsWith('video/') ? 'video' : 'image' });

      if (file.type.startsWith('image/')) {
        const imageData = await prepareImageForGemini(file);
        base64Data = imageData.base64;
        mimeType = imageData.mimeType;
        setLastMediaData({ base64: base64Data, mimeType });
        await analyzeWithGemini(base64Data, mimeType);
      } else if (file.type.startsWith('video/')) {
        const frameData = await extractVideoFrame(file);
        base64Data = frameData.base64;
        mimeType = frameData.mimeType;
        setLastMediaData({ base64: base64Data, mimeType });
        await analyzeWithGemini(base64Data, mimeType);
      } else {
        throw new Error("Format file tidak didukung. Harap upload gambar atau video.");
      }
    } catch (error: any) {
      console.error(error);
      setAlert({ type: 'error', message: error.message || 'Gagal menganalisa media.' });
      setMediaPreview(null);
    } finally {
      setAutoWriting(false);
      // Reset input supaya bisa upload file yang sama lagi jika perlu
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRegenerate = async () => {
    if (autoWriting || loading) return;

    if (lastMediaData) {
      setAutoWriting(true);
      try {
        await analyzeWithGemini(lastMediaData.base64, lastMediaData.mimeType);
      } catch (err) {
        console.error(err);
      } finally {
        setAutoWriting(false);
      }
    } else {
      handleAutoWrite();
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      setAlert({ type: 'error', message: 'Mohon isi teks terlebih dahulu.' });
      return;
    }

    setLoading(true);
    setAlert({ type: '', message: '' });
    setAudioUrl(null);

    try {
      // Gemini TTS
      let textToSpeech = text;
      if (styleInstruction) {
        textToSpeech = `[${styleInstruction}] ${text}`;
      }

      const response = await executeWithRetry((ai) => 
        ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: textToSpeech }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: geminiVoice
                }
              }
            }
          }
        })
      );
      
      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioData) throw new Error("Gagal generate audio Gemini.");

      const wavUrl = pcmBase64ToWavUrl(audioData, 24000); 
      setAudioUrl(wavUrl);
      
      // Add to history
      const newHistoryItem = {
        id: Date.now().toString(),
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        url: wavUrl,
        voice: geminiVoice,
        date: new Date()
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 5));

      setAlert({ type: 'success', message: 'Audio berhasil dibuat dengan Gemini!' });
      setCooldown(20); // Jeda 20 detik setelah generate audio
    } catch (err: any) {
      console.error(err);
      setAlert({ type: 'error', message: err.message || 'Terjadi kesalahan saat generate audio.' });
    } finally {
      setLoading(false);
    }
  };

  // --- Utility: PCM to WAV (Essential for Gemini TTS Playback) ---
  const pcmBase64ToWavUrl = (base64: string, sampleRate: number) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + len, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, len, true);

    const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-lime-500/30 selection:text-lime-200">
      
      {/* 2.2 Header (Sticky) */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center shadow-lg shadow-lime-500/20">
              <Volume2 className="text-neutral-900 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-xl font-bold tracking-tight uppercase leading-none">
                BANG DIGITAL <span className="text-lime-400">VOICE</span>
              </h1>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                <span className="text-[10px] sm:text-xs text-neutral-500 font-medium tracking-wide truncate max-w-[120px] sm:max-w-none">
                  Bikin VO Promosi TikTok
                </span>
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[8px] sm:text-[9px] font-bold whitespace-nowrap transition-all ${
                  userApiKey 
                    ? 'bg-lime-500/10 border-lime-500/30 text-lime-400' 
                    : 'bg-neutral-900 border-white/5 text-neutral-500'
                }`}>
                  {userApiKey ? (
                    <>
                      <ShieldCheck className="w-2.5 h-2.5" />
                      PERSONAL KEY ACTIVE
                    </>
                  ) : (
                    <>
                      <Zap className="w-2.5 h-2.5 text-lime-500" />
                      PUBLIC POOL (SLOT: {activeKeyIndex + 1})
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl border transition-all ${
                showSettings ? 'bg-lime-500/10 border-lime-500/50 text-lime-400' : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
              }`}
              title="Pengaturan API Key"
            >
              <Settings className="w-5 h-5" />
            </button>
            {!isOnline && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/30 border border-red-500/20 text-red-400 text-[10px] font-bold animate-pulse">
                <AlertCircle className="w-3 h-3" />
                OFFLINE
              </div>
            )}
            {isInstallable && (
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/30 text-lime-400 text-xs font-bold transition-all animate-pulse"
              >
                <Download className="w-3.5 h-3.5" />
                INSTALL APP
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* 2.5 Settings Panel (BYOK) */}
        {showSettings && (
          <div className="bg-neutral-900 rounded-2xl sm:rounded-3xl border border-lime-500/30 shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lime-400 text-[10px] sm:text-xs font-bold tracking-wider uppercase">
                <Key className="w-3.5 h-3.5 sm:w-4 h-4" />
                PENGATURAN API KEY (BYOK)
              </div>
              <div className="flex items-center gap-2">
                {userApiKey && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-lime-500/10 border border-lime-500/20 text-[9px] font-bold text-lime-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                    USER KEY ACTIVE
                  </div>
                )}
                <button onClick={() => setShowSettings(false)} className="text-neutral-500 hover:text-white p-1">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed">
              Gunakan API Key Gemini Anda sendiri untuk menghindari antrian dan limit kuota publik. 
              Kunci Anda disimpan secara aman hanya di browser Anda (Local Storage).
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="password"
                  placeholder="Masukkan API Key Gemini Anda..."
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lime-500/50 transition-all"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => saveUserKey(userApiKey)}
                    className="flex-1 sm:flex-none bg-lime-500 hover:bg-lime-400 text-neutral-900 px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all min-h-[44px]"
                  >
                    <Save className="w-4 h-4" />
                    SIMPAN
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleCheckApiKey}
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  CEK VALIDITAS
                </button>
                <button 
                  onClick={handleResetApiKey}
                  className="flex-1 sm:flex-none bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  RESET BERSIH
                </button>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-lime-400" />
                  DAPATKAN KEY
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <button 
                onClick={() => setShowGuide(!showGuide)}
                className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-lime-400 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                CARA MENDAPATKAN & MENGGUNAKAN API KEY
                {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              
              {showGuide && (
                <div className="mt-4 space-y-4 text-xs text-neutral-400 bg-neutral-950/50 rounded-2xl p-4 border border-white/5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-2">
                    <h4 className="text-lime-400 font-bold uppercase tracking-wider">Langkah 1: Dapatkan API Key</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-1">
                      <li>Klik tombol <span className="text-white">"DAPATKAN KEY"</span> di atas atau buka <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-lime-500 hover:underline">Google AI Studio</a>.</li>
                      <li>Login menggunakan akun Google Anda.</li>
                      <li>Klik tombol biru <span className="text-white">"Create API key"</span>.</li>
                      <li>Pilih project atau buat baru, lalu klik <span className="text-white">"Create API key in new project"</span>.</li>
                      <li>Salin (Copy) kode API Key yang muncul.</li>
                    </ol>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-lime-400 font-bold uppercase tracking-wider">Langkah 2: Gunakan di App Ini</h4>
                    <ul className="list-disc list-inside space-y-1 ml-1">
                      <li>Tempel (Paste) kode tadi ke kolom input di atas.</li>
                      <li>Klik tombol <span className="text-white">"SIMPAN"</span>.</li>
                      <li>Status di header akan berubah menjadi <span className="text-lime-500">"PERSONAL KEY ACTIVE"</span>.</li>
                      <li>Sekarang Anda bisa menggunakan aplikasi tanpa antrian dan limit publik!</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {userApiKey && (
              <button 
                onClick={() => {
                  saveUserKey('');
                  setAlert({ type: 'success', message: 'Kembali menggunakan Pool Publik.' });
                }}
                className="text-[10px] text-red-400 hover:underline uppercase font-bold tracking-widest"
              >
                Hapus & Gunakan Kunci Publik
              </button>
            )}
          </div>
        )}

        {/* 3. Komposisi Grid (Desktop View) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 3.1 Kolom Kiri (1/3 Lebar) - Panel Konfigurasi */}
          <div className="space-y-6">
            
            {/* Kartu 1: Konfigurasi Utama */}
            <div className="bg-neutral-900 rounded-2xl sm:rounded-3xl border border-white/5 shadow-xl p-5 sm:p-6 space-y-6">
              <div className="flex items-center gap-2 text-neutral-400 text-[10px] sm:text-xs font-bold tracking-wider uppercase">
                <Zap className="w-3.5 h-3.5" />
                KONFIGURASI
              </div>

              {/* MODE GEMINI */}
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-neutral-300">Pilih Suara</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <select 
                          value={geminiVoice}
                          onChange={(e) => setGeminiVoice(e.target.value)}
                          className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-lime-500/50 text-neutral-200 text-sm min-h-[48px]"
                        >
                          {GEMINI_VOICES.map(v => (
                            <option key={v.name} value={v.name}>{v.label}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-4 pointer-events-none text-neutral-500">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                      </div>
                      <button 
                        onClick={handlePreviewVoice}
                        disabled={previewingVoice}
                        className="w-12 h-12 rounded-xl bg-neutral-950 border border-white/10 flex items-center justify-center text-lime-500 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                        title="Cek Suara"
                      >
                        {previewingVoice ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-neutral-300">Style Instruction</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3.5 text-neutral-600 w-4 h-4" />
                      <input 
                        type="text" 
                        value={styleInstruction}
                        onChange={(e) => setStyleInstruction(e.target.value)}
                        placeholder="Contoh: Bisikkan..."
                        className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-9 pr-3 py-3 focus:outline-none focus:border-lime-500/50 text-neutral-200 text-sm placeholder:text-neutral-700 min-h-[48px]"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {GEMINI_STYLES.map((style, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setStyleInstruction(style)}
                          className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[9px] sm:text-[10px] text-neutral-400 transition-colors border border-white/5"
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-neutral-300">Dialek Lokal</label>
                    <div className="grid grid-cols-2 gap-2">
                      {LOCAL_LANGUAGES.map(lang => (
                        <button
                          key={lang.id}
                          onClick={() => setLocalLanguage(lang.id)}
                          className={`px-2 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-bold border transition-all min-h-[40px] flex items-center justify-center text-center ${
                            localLanguage === lang.id 
                              ? 'bg-lime-500 border-lime-500 text-neutral-900' 
                              : 'bg-neutral-950 border-white/10 text-neutral-400 hover:border-white/20'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime-950/30 border border-lime-500/20 text-lime-400 text-xs font-medium">
                      <Sparkles className="w-3 h-3" />
                      Gratis & Cepat
                    </div>
                  </div>
                </div>
            </div>

            {/* Kartu 2: Statistik (Hidden on Mobile) */}
            <div className="hidden md:block bg-neutral-900 rounded-3xl border border-white/5 p-6 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider">Panjang Karakter</span>
                <span className="text-2xl font-mono text-white">{text.length}</span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-lime-500 transition-all duration-500" 
                  style={{ width: `${Math.min((text.length / 500) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-neutral-500 pt-1">
                <span>Estimasi Waktu</span>
                <span>~{Math.ceil(text.length / 15)} detik</span>
              </div>
            </div>
          </div>

          {/* 3.2 Kolom Kanan (2/3 Lebar) - Editor & Output */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Kartu Baru: Analisa Media (Lebih Menonjol) */}
            <div className="bg-neutral-900 rounded-2xl sm:rounded-3xl border border-white/5 p-5 sm:p-6 flex flex-col relative overflow-hidden shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-neutral-400 tracking-wider uppercase">
                  <ImageIcon className="w-4 h-4 text-lime-500" />
                  ANALISA PRODUK (GAMBAR / VIDEO)
                </h3>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,video/*" 
              />

              {!mediaPreview ? (
                <button 
                  onClick={handleFileClick}
                  disabled={autoWriting || loading}
                  className="w-full h-36 sm:h-40 rounded-2xl border-2 border-dashed border-white/10 hover:border-lime-500/50 hover:bg-lime-950/20 transition-all flex flex-col items-center justify-center gap-3 text-neutral-500 hover:text-lime-400 group disabled:opacity-50 disabled:cursor-not-allowed bg-neutral-950/50"
                >
                  {autoWriting ? (
                    <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
                  ) : (
                    <div className="p-3 bg-white/5 rounded-full group-hover:bg-lime-500/10 transition-colors">
                      <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  )}
                  <span className="text-xs sm:text-sm font-medium px-4 text-center">
                    {autoWriting ? 'Sedang Menganalisa...' : 'Upload Media & Buat Skrip Otomatis'}
                  </span>
                </button>
              ) : (
                <div className="relative w-full h-56 sm:h-64 rounded-2xl border border-white/10 overflow-hidden group bg-black/50 shadow-inner">
                  {mediaPreview.type === 'image' ? (
                    <img src={mediaPreview.url} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <video src={mediaPreview.url} className="w-full h-full object-contain" controls />
                  )}
                  
                  {/* Overlay Processing */}
                  {autoWriting && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                      <Loader2 className="w-10 h-10 animate-spin text-lime-500 mb-3" />
                      <span className="text-sm font-bold text-lime-400 animate-pulse tracking-wide">AI Sedang Menulis Skrip...</span>
                    </div>
                  )}

                  <button 
                    onClick={() => setMediaPreview(null)}
                    disabled={autoWriting}
                    className="absolute top-3 right-3 bg-black/50 hover:bg-red-500 text-white/70 hover:text-white p-2 rounded-full backdrop-blur-md transition-all z-30 disabled:opacity-50 hover:scale-110"
                    title="Hapus Media"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Grounding Sources */}
              {sources.length > 0 && (
                <div className="mt-4 p-3 sm:p-4 bg-neutral-950/50 rounded-2xl border border-white/5 animate-fadeIn">
                  <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
                    <Sparkles className="w-3 h-3 text-lime-500" />
                    Sumber Data Real-time
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[9px] sm:text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-400 px-2 py-1 rounded-md border border-white/5 transition-colors max-w-[150px] sm:max-w-[200px] truncate"
                      >
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Kartu 1: Script Editor */}
            <div className="bg-neutral-900 rounded-2xl sm:rounded-3xl border border-white/5 flex flex-col relative overflow-hidden shadow-xl">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 sm:px-6 py-4 border-b border-white/5 bg-neutral-950/30 gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-[10px] sm:text-xs font-bold text-neutral-400 tracking-wider uppercase">SKRIP PROMOSI (HOOK & CTA)</h3>
                  {text && (
                    <button 
                      onClick={handleCopy}
                      className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-lime-400 transition-all flex items-center gap-1.5"
                      title="Salin Skrip"
                    >
                      {copied ? <Check className="w-3 h-3 text-lime-500" /> : <Copy className="w-3 h-3" />}
                      <span className="text-[9px] font-bold uppercase">{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4">
                  {text && (
                    <button 
                      onClick={handleRegenerate}
                      disabled={autoWriting || loading}
                      className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-neutral-400 hover:text-lime-400 transition-colors disabled:opacity-50"
                      title="Buat Ulang Skrip"
                    >
                      <Zap className={`w-3.5 h-3.5 ${autoWriting ? 'animate-spin' : ''}`} />
                      Regenerate
                    </button>
                  )}
                  
                  <button 
                    onClick={handleAutoWrite}
                    disabled={autoWriting || loading}
                    className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-lime-400 hover:text-lime-300 transition-colors disabled:opacity-50"
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${autoWriting && !mediaPreview ? 'animate-spin' : ''}`} />
                    Tulis Tanpa Media (AI)
                  </button>
                </div>
              </div>

              {/* Input Area */}
              <div className="flex-1 min-h-[220px] sm:h-[280px] relative flex flex-col">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Skrip promosi akan muncul di sini..."
                  className="flex-1 w-full bg-transparent p-5 sm:p-6 text-base sm:text-lg text-neutral-200 placeholder:text-neutral-700 resize-none focus:outline-none leading-relaxed font-light"
                  spellCheck="false"
                />
                
                {/* Viral Formulas */}
                <div className="px-5 sm:px-6 pb-4 flex flex-wrap gap-2">
                  <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest w-full mb-1">Formula Viral:</span>
                  {VIRAL_FORMULAS.map((formula, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setText(formula.text)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-white/5 text-[10px] text-neutral-400 hover:text-lime-400 hover:border-lime-500/30 transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3" />
                      {formula.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Action Bar */}
              <div className="p-4 sm:p-5 border-t border-white/5 bg-neutral-950/30 space-y-4">
                
                {/* Alert Area */}
                {alert.message && (
                  <div className={`flex items-center gap-2 text-xs sm:text-sm px-4 py-3 rounded-xl border ${
                    alert.type === 'error' ? 'bg-red-950/30 border-red-500/30 text-red-200' : 'bg-lime-950/30 border-lime-500/30 text-lime-200'
                  } animate-fadeIn`}>
                    {alert.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
                    <span className="leading-tight">{alert.message}</span>
                  </div>
                )}

                {/* Tombol Utama */}
                <button
                  onClick={handleGenerate}
                  disabled={loading || !isOnline || cooldown > 0}
                  className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold tracking-wide transition-all duration-300 ${
                    loading || !isOnline || cooldown > 0
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-lime-500 to-lime-400 hover:to-lime-300 text-neutral-900 shadow-lg shadow-lime-500/20 hover:scale-[1.01] hover:shadow-lime-500/30'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      MEMPROSES...
                    </>
                  ) : !isOnline ? (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      OFFLINE
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <Zap className="w-5 h-5 text-lime-500 animate-pulse" />
                      TUNGGU {cooldown}s
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-5 h-5" />
                      BUAT SUARA TIKTOK
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Kartu 2: Result Player (Conditional) */}
            {audioUrl && (
              <div className="bg-neutral-900 rounded-2xl sm:rounded-3xl border border-lime-500/20 p-5 sm:p-6 shadow-2xl shadow-lime-500/10 animate-slideUp overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Volume2 className="w-32 h-32 text-lime-500 rotate-12" />
                </div>
                
                <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-lime-500/10 rounded-xl flex items-center justify-center border border-lime-500/20">
                        <CheckCircle className="w-5 h-5 text-lime-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-wider uppercase">AUDIO SIAP DIGUNAKAN</h4>
                        <p className="text-[10px] text-neutral-500 font-medium">Format: WAV (High Quality) • Voice: {geminiVoice}</p>
                      </div>
                    </div>
                    
                    <CustomPlayer src={audioUrl} />
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2">
                    <a
                      href={audioUrl}
                      download={`suara-tiktok-${Date.now()}.wav`}
                      className="flex-1 sm:flex-none h-14 sm:h-16 px-6 sm:px-8 bg-lime-500 hover:bg-lime-400 text-neutral-900 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-lime-500/20 active:scale-95 group"
                    >
                      <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                      <span className="text-sm font-bold uppercase tracking-tight">SIMPAN MP3</span>
                    </a>
                    <button 
                      onClick={() => setAudioUrl(null)}
                      className="w-14 sm:w-16 h-14 sm:h-16 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-2xl flex items-center justify-center transition-all border border-white/5"
                      title="Tutup"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Riwayat Sesi */}
            {history.length > 0 && (
              <div className="bg-neutral-900 rounded-2xl sm:rounded-3xl border border-white/5 p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-neutral-400 tracking-wider uppercase">
                    <History className="w-4 h-4 text-lime-500" />
                    RIWAYAT SESI (TERAKHIR)
                  </h3>
                  <span className="text-[10px] text-neutral-600 font-mono italic">Hanya sesi ini</span>
                </div>
                
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="p-3 bg-neutral-950/50 rounded-xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3 group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-lime-500 uppercase">{item.voice}</span>
                          <span className="text-[9px] text-neutral-600 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 truncate italic">"{item.text}"</p>
                      </div>
                      <div className="w-full sm:w-48">
                        <CustomPlayer src={item.url} />
                      </div>
                      <a 
                        href={item.url} 
                        download={`audio-${item.id}.mp3`}
                        className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInBottom { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideInBottom { animation: slideInBottom 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}
