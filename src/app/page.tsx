'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { UploadZone } from '@/components/UploadZone';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-start p-8 sm:p-20 font-sans text-white">
      <main className="w-full max-w-5xl flex flex-col items-center gap-16 relative z-10 pt-10 mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 flex flex-col items-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter flex flex-col md:flex-row items-center gap-4">
            Manhwa Çevirisi
            <Sparkles className="text-indigo-400 w-12 h-12 md:w-16 md:h-16" />
          </h1>
          <p className="max-w-xl text-lg text-foreground/60 leading-relaxed">
            Profesyonel kalitede, bağlama duyarlı ve anında Manhwa çevirisi. Yüksek çözünürlüklü panelleri yükleyin, yapay zeka saniyeler içinde dizgisini yapsın.
          </p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
           <UploadZone />
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          {[
            { icon: <Zap className="text-indigo-400" />, title: "Ultra Hızlı", desc: "Dakikalar süren bölümleri saniyeler içinde işleyin." },
            { icon: <ShieldCheck className="text-pink-400" />, title: "Piksel Hassasiyeti", desc: "Gelişmiş inpainting ile kusursuz panel temizliği." },
            { icon: <ImageIcon className="text-indigo-400" />, title: "Smart Typesetting", desc: "Baloncuk boyutuna göre dinamik metin yerleşimi." }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="p-6 glass rounded-3xl space-y-4 hover:border-indigo-500/50 transition-colors group"
            >
              <div className="p-3 bg-white/5 rounded-xl w-fit group-hover:bg-indigo-500/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="font-bold text-xl">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
