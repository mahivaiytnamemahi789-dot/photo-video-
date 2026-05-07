/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { Sparkles, Heart, Cloud, Moon, Star, Upload, Play, RefreshCcw, Camera, Wand2, ArrowLeft, Download, MessageCircle, X, Send, Bot } from 'lucide-react';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Soft Pastel Theme
const THEME = {
  softPink: '#FCE4EC',
  softMint: '#E8F5E9',
  softLavender: '#F3E5F5',
  softCream: '#FFF9C4',
  textSoft: '#880E4F',
};

type AppState = 'home' | 'upload' | 'generating' | 'video';

export default function App() {
  const [appState, setAppState] = useState<AppState>('home');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: 'Hi! I am Luna, your soft anime energy assistant. 🌸 I can help you create 10-second cinematic videos. How are we feeling today?' }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isBotOpen]);

  const handleDownloadVideo = async () => {
    if (!uploadedImage) return;
    setIsRecording(true);
    setRecordProgress(0);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const img = new Image();
      img.src = uploadedImage;
      await new Promise((resolve) => { img.onload = resolve; });

      // Use aspect-ratio consistent sizing
      const maxWidth = 1280;
      const scaleDown = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scaleDown;
      canvas.height = img.height * scaleDown;

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `soft-anime-video-${Date.now()}.webm`;
        link.click();
        setIsRecording(false);
      };

      recorder.start();

      const startTime = Date.now();
      const duration = 10000; // 10 seconds

      const render = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progressRaw = elapsed / duration;
        setRecordProgress(Math.min(progressRaw * 100, 100));

        if (progressRaw >= 1) {
          recorder.stop();
          return;
        }

        // Draw Cinematic Frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = 'saturate(1.2) brightness(1.05) contrast(1.05)';
        
        // Match the App.tsx animation style (Scale + Pan)
        const scale = 1 + Math.sin(progressRaw * Math.PI) * 0.05;
        const xOffset = Math.sin(progressRaw * Math.PI * 2) * (canvas.width * 0.02);
        const yOffset = Math.cos(progressRaw * Math.PI * 2) * (canvas.height * 0.01);

        ctx.save();
        ctx.translate(canvas.width / 2 + xOffset, canvas.height / 2 + yOffset);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        ctx.restore();

        // Add soft sparkles
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        for (let i = 0; i < 15; i++) {
          const px = (Math.sin(i * 100) * 0.5 + 0.5) * canvas.width;
          const py = ((Math.cos(i * 50) * 0.5 + 0.5) * canvas.height - (progressRaw * canvas.height)) % canvas.height;
          ctx.beginPath();
          ctx.arc(px, py < 0 ? py + canvas.height : py, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Vignette
        const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/0.8);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.2)');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0, canvas.width, canvas.height);

        requestAnimationFrame(render);
      };

      render();
    } catch (error) {
      console.error('Video recording failed:', error);
      setIsRecording(false);
      handleDownload(); // Fallback to photo
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatMessage.trim()) return;

    const newHistory = [...chatHistory, { role: 'user' as const, text: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');

    // Simple bot logic
    setTimeout(() => {
      let botResponse = "That sounds lovely! I'm here to make everything soft and sparkly.";
      const msg = chatMessage.toLowerCase();
      
      if (msg.includes('download') || msg.includes('app') || msg.includes('get') || msg.includes('kivabe')) {
        botResponse = "To 'download' this app's source code, use the Settings menu (gear icon) to export a ZIP or push to GitHub! To save your creation, just click 'Export 10s Cinematic Video' below your preview! ✨";
      } else if (msg.includes('video') || msg.includes('10')) {
        botResponse = "I've unlocked the 10-second recorder! 🎥 Once your generation is done, click the Export button and I'll capture the magic in a high-quality video file for you.";
      } else if (msg.includes('ami') || msg.includes('kemon')) {
        botResponse = "Apni khub bhalo! 🌸 I hope you are having a wonderful, sparkly day. How can I help you today?";
      } else if (msg.includes('mower') || msg.includes('zero turn')) {
        botResponse = "A zero-turn mower! 🚜 I'll make sure it glides through the softest anime clouds with maximum grace. Pure mower energy, but soft!";
      } else if (msg.includes('love') || msg.includes('good') || msg.includes('wow') || msg.includes('bhalo')) {
        botResponse = "Aww, you're making me blush! 🌸 I love creating these dreamy vibes for you. Keep being sparkly!";
      }
      setChatHistory([...newHistory, { role: 'bot', text: botResponse }]);
    }, 600);
  };

  // Generate background particles
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  useEffect(() => {
    setParticles(Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    })));
  }, []);

  // Simulate 10-second video generation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (appState === 'generating') {
      const startTime = Date.now();
      const duration = 10000; // 10 seconds

      timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          clearInterval(timer);
          setAppState('video');
        }
      }, 50);
    }
    return () => clearInterval(timer);
  }, [appState]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setAppState('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (!uploadedImage) return;

    try {
      // Direct binary conversion - the most compatible way to handle Data URLs for download
      const byteString = atob(uploadedImage.split(',')[1]);
      const mimeString = uploadedImage.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = `soft-anime-dream-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 5000);
    } catch (e) {
      console.error('Download failed:', e);
      // Absolute fallback
      const link = document.createElement('a');
      link.href = uploadedImage;
      link.download = 'dreamy-capture.png';
      link.click();
    }
  };

  const startGeneration = () => {
    setProgress(0);
    setAppState('generating');
  };

  const reset = () => {
    setAppState('home');
    setUploadedImage(null);
    setProgress(0);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center font-sans text-stone-800 p-4 bg-stone-50">
      {/* Ethereal Looping Video-style Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#FCE4EC]">
        {/* Soft Fluid Blobs */}
        <motion.div 
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#E8F5E9] mix-blend-multiply filter blur-[80px] opacity-40"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#F3E5F5] mix-blend-multiply filter blur-[80px] opacity-40"
          animate={{
            x: [0, -40, 0],
            y: [0, 60, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-[#FFF9C4] mix-blend-multiply filter blur-[90px] opacity-30"
          animate={{
            x: [0, -30, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Shimmer Overlay */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 10% 10%, rgba(255,255,255,0.8) 0%, transparent 40%)',
              'radial-gradient(circle at 90% 90%, rgba(255,255,255,0.8) 0%, transparent 40%)',
              'radial-gradient(circle at 10% 10%, rgba(255,255,255,0.8) 0%, transparent 40%)',
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Floating Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 rounded-full bg-white opacity-40"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [0, -40, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: p.delay }}
        />
      ))}

      <AnimatePresence mode="wait">
        {appState === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-10 flex flex-col items-center max-w-lg w-full text-center"
          >
            <div 
              className="relative group cursor-pointer mb-8"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="absolute -inset-8 bg-white/30 rounded-full blur-3xl" />
              <motion.div 
                className="relative w-56 h-56 rounded-full border-4 border-white/60 overflow-hidden shadow-2xl bg-white/20 backdrop-blur-md"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=800" 
                  alt="AI Soft Anime"
                  className="w-full h-full object-cover transform scale-110"
                />
                <div className="absolute inset-0 bg-[#880E4F]/10 mix-blend-soft-light" />
              </motion.div>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif italic text-[#880E4F] tracking-tighter mb-4">
              AI Soft Anime 🍦
            </h1>
            <p className="text-[#880E4F]/70 mb-10 text-sm md:text-base leading-relaxed max-w-sm">
              Create a dreamy 10-second cinematic animation from any photo. Zero cost, pure soft energy.
            </p>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#ffffff' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 bg-white/90 text-[#880E4F] px-10 py-5 rounded-full shadow-[0_15px_30px_-5px_rgba(255,255,255,0.4)] backdrop-blur-md border border-white font-semibold transition-all active:shadow-inner"
            >
              <Upload size={20} />
              Upload a Picture
            </motion.button>

            <p className="mt-6 text-[#880E4F]/40 text-[10px] uppercase tracking-[0.2em] font-medium">
              Support JPG • PNG • WEBP
            </p>
          </motion.div>
        )}

        {appState === 'upload' && uploadedImage && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="z-10 flex flex-col items-center w-full max-w-2xl px-4"
          >
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 bg-white/20 backdrop-blur-md">
              <img src={uploadedImage} className="w-full h-full object-cover" alt="Preview" />
              <div className="absolute inset-0 bg-black/10" />
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={reset}
                className="absolute top-6 left-6 p-3 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-lg border border-white/30 transition-all shadow-lg"
              >
                <ArrowLeft size={18} />
              </motion.button>
            </div>

            <div className="mt-10 flex flex-col items-center gap-8 w-full">
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[#880E4F]/60 text-xs bg-white/50 px-4 py-2 rounded-full border border-white/50 shadow-sm">
                  <Camera size={14} />
                  Anime Quality
                </div>
                <div className="flex items-center gap-2 text-[#880E4F]/60 text-xs bg-white/50 px-4 py-2 rounded-full border border-white/50 shadow-sm">
                  <Wand2 size={14} />
                  Soft Mode
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(136,14,79,0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={startGeneration}
                className="flex items-center gap-3 bg-gradient-to-r from-[#880E4F] to-[#d81b60] text-white px-12 py-6 rounded-full shadow-2xl font-bold text-lg active:scale-95 transition-all"
              >
                <Play size={20} fill="currentColor" />
                Create 10s Video
              </motion.button>
            </div>
          </motion.div>
        )}

        {appState === 'generating' && (
          <motion.div 
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="z-10 flex flex-col items-center w-full max-w-md text-center"
          >
            <div className="mb-12 relative">
              <motion.div 
                className="w-32 h-32 rounded-full border-4 border-[#880E4F]/10 flex items-center justify-center bg-white/20 backdrop-blur-sm"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Wand2 className="text-[#880E4F]" size={40} />
              </motion.div>
              <motion.div 
                className="absolute inset-0 border-t-4 border-[#880E4F] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <h2 className="text-3xl font-serif italic text-[#880E4F] mb-6">Sprinkling Softness...</h2>
            
            <div className="w-full h-3 bg-white/40 rounded-full overflow-hidden border border-white/50 mb-6 shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#880E4F] to-[#f06292]"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-[#880E4F]/60 text-xs font-bold tracking-[0.3em] uppercase">
              {Math.round(progress)}% • Processing Energy
            </p>
          </motion.div>
        )}

        {appState === 'video' && uploadedImage && (
          <motion.div 
            key="video"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-10 flex flex-col items-center w-full max-w-4xl"
          >
            <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-30px_rgba(136,14,79,0.3)] border-[6px] border-white/90 group ring-1 ring-white/20 bg-stone-100">
              
              <motion.div 
                className="absolute inset-0 z-0"
                animate={{
                  scale: [1, 1.08, 1],
                  x: [0, 5, -5, 0],
                  y: [0, -3, 3, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: 'saturate(1.1) brightness(1.02) contrast(1.02)' }}
              >
                <img src={uploadedImage} className="w-full h-full object-cover" alt="Video Content" />
              </motion.div>

              {/* Cinematic Bloom Overlays - Adjusted for transparency */}
              <motion.div 
                className="absolute inset-0 z-10 bg-gradient-to-tr from-rose-200/5 via-transparent to-indigo-200/5 pointer-events-none"
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 8, repeat: Infinity }}
              />

              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-white/60 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -150],
                      opacity: [0, 0.8, 0],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 6,
                      repeat: Infinity,
                      delay: Math.random() * 10,
                    }}
                  />
                ))}
              </div>

              {/* Edge Vignette */}
              <div className="absolute inset-0 z-25 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.2)] rounded-[2rem]" />

              <motion.div 
                className="absolute inset-0 z-30 pointer-events-none opacity-20"
                animate={{
                  background: [
                    'radial-gradient(circle at 10% 10%, rgba(255,255,255,0.4) 0%, transparent 50%)',
                    'radial-gradient(circle at 90% 90%, rgba(255,255,255,0.4) 0%, transparent 50%)',
                    'radial-gradient(circle at 10% 10%, rgba(255,255,255,0.4) 0%, transparent 50%)',
                  ]
                }}
                transition={{ duration: 10, repeat: Infinity }}
              />

              <div className="absolute bottom-8 left-8 z-40 bg-black/40 backdrop-blur-xl text-white px-5 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] flex items-center gap-3 border border-white/20">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-ping" />
                10S CINEMATIC AI • SOFT 🍦
              </div>

              {/* Recording Overlay */}
              {isRecording && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-6"
                  >
                    <Wand2 size={48} className="text-pink-300" />
                  </motion.div>
                  <h3 className="text-xl font-serif italic mb-2">Recording Magic...</h3>
                  <div className="w-64 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-pink-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${recordProgress}%` }}
                    />
                  </div>
                  <p className="mt-4 text-[10px] uppercase tracking-widest opacity-50">Capturing Soft Anime Energy</p>
                </div>
              )}
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-5">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={reset}
                className="flex items-center gap-3 bg-white/90 text-[#880E4F] px-10 py-5 rounded-full shadow-lg border border-white font-bold transition-all active:shadow-inner"
              >
                <RefreshCcw size={18} />
                Create Another
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(136,14,79,0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadVideo}
                disabled={isRecording}
                className={`flex items-center gap-3 bg-gradient-to-br from-[#880E4F] to-[#d81b60] text-white px-10 py-5 rounded-full shadow-2xl font-bold transition-all ${isRecording ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
              >
                <Download size={20} />
                {isRecording ? 'Recording...' : 'Export 10s Cinematic Video'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Ambience */}
      <div className="absolute bottom-12 left-12 opacity-[0.05] pointer-events-none">
        <Moon className="text-[#880E4F]" size={80} />
      </div>
      <div className="absolute top-12 right-12 opacity-[0.05] pointer-events-none">
        <Sparkles className="text-[#880E4F]" size={80} />
      </div>

      {/* Luna Bot UI */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        <AnimatePresence>
          {isBotOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="mb-4 w-80 h-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white overflow-hidden flex flex-col"
            >
              <div className="p-4 bg-[#880E4F] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Luna AI</h3>
                    <p className="text-[10px] opacity-70">Soft Energy Expert</p>
                  </div>
                </div>
                <button onClick={() => setIsBotOpen(false)} className="hover:bg-white/10 p-1 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                      msg.role === 'user' 
                        ? 'bg-[#880E4F] text-white rounded-br-none' 
                        : 'bg-stone-100 text-stone-800 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-stone-100 flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-stone-100 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-[#880E4F]/30"
                />
                <button type="submit" className="bg-[#880E4F] text-white p-2 rounded-full hover:scale-110 active:scale-95 transition-transform">
                  <Send size={16} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsBotOpen(!isBotOpen)}
          className="w-14 h-14 bg-[#880E4F] text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white relative group"
        >
          {isBotOpen ? <X size={24} /> : <MessageCircle size={24} />}
          {!isBotOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-400 rounded-full border-2 border-white animate-pulse" />
          )}
          <span className="absolute right-16 bg-white text-[#880E4F] px-3 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm border border-stone-100 pointer-events-none">
            Chat with Luna
          </span>
        </motion.button>
      </div>
    </div>
  );
}

function FloatingIcon({ icon, x, y, delay }: { icon: ReactNode; x: number; y: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{ opacity: 1, scale: 1, x, y }}
      exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay }}
      className="absolute top-1/2 left-1/2 z-20 pointer-events-none"
    >
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
        {icon}
      </motion.div>
    </motion.div>
  );
}



