import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileImage, Layers, CheckCircle2, Languages, Loader2, Wand2, Image as ImageIcon, Link2 } from 'lucide-react';
import { sliceWebtoonImage, ImageSlice } from '@/lib/image-utils';
import type { TranslationResult } from '@/lib/gemini';
import { renderTranslationsToCanvas } from '@/lib/canvas-engine';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';

// Extended status to track translation and rendering
type FileStatus = 'idle' | 'slicing' | 'translating' | 'rendering' | 'done' | 'error';

interface FileUploadState {
  file: File;
  slices?: ImageSlice[];
  translations?: TranslationResult[];
  finalImages?: string[];
  status: FileStatus;
  error?: string;
}

export const UploadZone = () => {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  const fetchUrl = async () => {
    if (!urlInput.trim()) return;
    setIsFetchingUrl(true);
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      });
      
      if (!res.ok) {
        throw new Error((await res.json()).error || 'Failed to fetch URL');
      }
      
      const { images } = await res.json();
      
      const fetchedFiles = images.map((base64: string, index: number) => {
        const [header, data] = base64.split(',');
        const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(data);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], `fetched-panel-${index + 1}.jpg`, { type: mime });
      });

      const newFilesStates = fetchedFiles.map((file: File) => ({
        file,
        status: 'idle' as FileStatus
      }));

      setFiles(prev => [...prev, ...newFilesStates]);
      newFilesStates.forEach((f: FileUploadState) => processFile(f.file));
      setUrlInput('');
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    setFiles(prev => prev.map(f => f.file === file ? { ...f, status: 'slicing' } : f));

    try {
      // 1. Slice the image
      const slices = await sliceWebtoonImage(file);
      
      // Update status to translating
      setFiles(prev => prev.map(f => f.file === file ? { ...f, slices, status: 'translating' } : f));

      // 2. Translate each slice
      const translations: TranslationResult[] = [];
      
      for (let i = 0; i < slices.length; i++) {
         const slice = slices[i];
         let retryCount = 0;
         let success = false;
         
         while (!success && retryCount < 4) {
           try {
             const response = await fetch('/api/translate', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                 imageBase64: slice.dataUrl,
                 mimeType: file.type // Pass the original mimetype (e.g., image/jpeg)
               })
             });

             if (!response.ok) {
               const errData = await response.json();
               const errMsg = errData.error || 'Translation failed';
               
               // Check if it's a rate limit error (status 429 or nested message)
               if (response.status === 429 || errMsg.includes('429') || errMsg.includes('exceeded') || errMsg.includes('RESOURCE_EXHAUSTED')) {
                 let waitTime = 15000; // Default 15s wait
                 const match = errMsg.match(/retry in (\d+\.?\d*)s/);
                 if (match && match[1]) {
                    waitTime = (parseFloat(match[1]) * 1000) + 2000; // adding 2s buffer
                 }
                 console.warn(`Rate limit hit on slice ${i+1}. Waiting ${Math.round(waitTime/1000)}s before retry ${retryCount + 1}...`);
                 await new Promise(r => setTimeout(r, waitTime));
                 retryCount++;
                 continue; // retry
               }
               
               throw new Error(errMsg);
             }

             const result: TranslationResult = await response.json();
             translations.push(result);
             success = true;
             
           } catch (apiError: any) {
             console.error(`API Error for slice ${i+1}:`, apiError);
             
             // If we errored natively due to rate bounds
             if (apiError.message?.includes('429') || apiError.message?.includes('exceeded')) {
                 console.warn(`Native Rate limit caught. Waiting 15s...`);
                 await new Promise(r => setTimeout(r, 15000));
                 retryCount++;
                 continue;
             }
             
             // Max retries or generic failure
             if (retryCount >= 3) {
                translations.push({ texts: [] }); 
                success = true; // exit loop with empty translation
             } else {
                await new Promise(r => setTimeout(r, 5000));
                retryCount++;
             }
           }
         }
         
         // Burst prevention delay
         if (success && i < slices.length - 1) {
             await new Promise(r => setTimeout(r, 2000)); // 2s gap between slices
         }
      }

      // 3. Render final images with Canvas Engine
      setFiles(prev => prev.map(f => f.file === file ? { ...f, translations, status: 'rendering' } : f));
      
      const finalImages: string[] = [];
      for (let i = 0; i < slices.length; i++) {
         const slice = slices[i];
         const translation = translations[i];
         if (translation && translation.texts && translation.texts.length > 0) {
           const renderedBase64 = await renderTranslationsToCanvas(slice, translation);
           finalImages.push(renderedBase64);
         } else {
           // If no translations, just push the original slice
           finalImages.push(slice.dataUrl);
         }
      }

      setFiles(prev => prev.map(f => f.file === file ? { ...f, finalImages, status: 'done' } : f));
      
    } catch (err: any) {
      console.error('Processing failed', err);
      setFiles(prev => prev.map(f => f.file === file ? { ...f, status: 'error', error: err.message } : f));
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const newFiles = Array.from(e.dataTransfer.files).map(file => ({
      file,
      status: 'idle' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(f => processFile(f.file));
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">

      {/* URL Input Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-2xl glass border border-white/10">
        <div className="hidden sm:block p-3 bg-white/5 rounded-xl">
          <Link2 size={20} className="text-primary" />
        </div>
        <input 
          type="url" 
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchUrl()}
          placeholder="Webtoon bölüm URL'sini yapıştırın..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-foreground/30 px-4 py-3 sm:py-0 w-full"
          disabled={isFetchingUrl}
        />
        <button 
          onClick={fetchUrl}
          disabled={!urlInput.trim() || isFetchingUrl}
          className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isFetchingUrl ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Bölüm çekiliyor ve çevriliyor...
            </>
          ) : 'Getir / Çevir'}
        </button>
      </div>

      <div className="flex items-center gap-4 text-foreground/40 my-6">
        <div className="h-px bg-white/10 flex-1"></div>
        <span className="text-xs font-medium uppercase tracking-widest">VEYA DOSYA YÜKLE</span>
        <div className="h-px bg-white/10 flex-1"></div>
      </div>

      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative p-12 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden
          ${isDragging ? 'border-primary bg-primary/10' : 'border-white/10 glass hover:border-white/20'}`}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-primary/20 rounded-2xl text-primary animate-bounce">
            <Upload size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Panelleri Buraya Bırak</h3>
            <p className="text-foreground/50 text-sm mt-1">PNG, JPG veya Manhwa ZIP dosyaları • Otomatik Slicing & Çeviri</p>
          </div>
        </div>
        
        {/* Animated Background Pulse */}
        <AnimatePresence>
          {isDragging && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/5 -z-10"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* File List */}
      <div className="space-y-3">
        {files.map((item, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={idx}
            className="p-4 glass rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                <FileImage className="text-primary" size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm truncate max-w-[200px]">{item.file.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-foreground/40 uppercase tracking-widest font-bold">
                   {item.status === 'slicing' ? (
                     <span className="flex items-center gap-1 text-primary"><Layers size={10} className="animate-spin" /> Dilimleniyor...</span>
                   ) : item.status === 'translating' ? (
                     <span className="flex items-center gap-1 text-accent"><Loader2 size={10} className="animate-spin" /> Çevriliyor...</span>
                   ) : item.status === 'rendering' ? (
                     <span className="flex items-center gap-1 text-pink-400"><Wand2 size={10} className="animate-spin" /> Dizgi Yapılıyor...</span>
                   ) : item.status === 'done' ? (
                     <span className="text-green-400 flex items-center gap-1"><CheckCircle2 size={10} /> Çeviri Tamamlandı ({item.translations?.reduce((acc, curr) => acc + (curr.texts?.length || 0), 0)} baloncuk)</span>
                   ) : item.status === 'error' ? (
                     <span className="text-red-400">Hata: {item.error}</span>
                   ) : 'Bekliyor'}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
              className="p-2 hover:bg-white/5 rounded-lg text-foreground/30 hover:text-red-400 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Translations Preview */}
      {files.some(f => f.status === 'done') && (
        <div className="mt-8 space-y-4">
          <h4 className="text-xl font-bold flex items-center gap-2"><Languages className="text-primary"/> Tespit Edilen Çeviriler</h4>
          <div className="grid grid-cols-1 gap-4">
            {files.filter(f => f.status === 'done').map((fileItem, fIdx) => (
               <div key={`result-${fIdx}`} className="p-6 glass rounded-[2rem] space-y-4 bg-white/[0.02]">
                 <p className="text-sm font-semibold text-primary">{fileItem.file.name}</p>
                 <div className="space-y-6">
                   {fileItem.translations?.map((sliceResult, sIdx) => (
                     sliceResult.texts.length > 0 && (
                       <div key={`slice-${sIdx}`} className="space-y-2 border-l-2 border-primary/20 pl-4">
                         <p className="text-xs text-foreground/40 uppercase tracking-wider">Dilim {sIdx + 1}</p>
                         <div className="grid gap-3">
                           {sliceResult.texts.map((textObj, tIdx) => (
                             <div key={tIdx} className="p-3 rounded-xl bg-black/20 text-sm">
                               <p className="text-foreground/50 line-through mb-1">{textObj.original_text}</p>
                               <p className="font-medium text-green-300">{textObj.translated_text}</p>
                               <div className="flex gap-2 mt-2">
                                <span className="text-[9px] px-2 py-1 rounded-md bg-white/5 text-foreground/40">{textObj.type.toUpperCase()}</span>
                                <span className="text-[9px] px-2 py-1 rounded-md bg-white/5 text-foreground/40">Güven: %{Math.round(textObj.confidence * 100)}</span>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )
                   ))}
                 </div>
               </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Render Preview (Premium Slider) */}
      {files.some(f => f.status === 'done') && (
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-bold flex items-center gap-3">
              <span className="p-2 bg-primary/20 text-primary rounded-xl"><ImageIcon size={24}/></span> 
              Ajans Çıktısı (Öncesi / Sonrası)
            </h4>
            <p className="text-sm text-foreground/50">Karşılaştırmak için sürükleyin</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            {files.filter(f => f.status === 'done').map((fileItem, fIdx) => (
               <div key={`render-${fIdx}`} className="space-y-4">
                 <p className="text-sm font-semibold text-primary px-2">{fileItem.file.name}</p>
                 <div className="flex flex-col items-center w-full max-w-3xl mx-auto bg-black/20 rounded-3xl p-4 shadow-2xl border border-white/5">
                   {/* We assume finalImages and slices arrays align correctly */}
                   {fileItem.finalImages?.map((imgSrc, sIdx) => {
                     const originalSrc = fileItem.slices?.[sIdx]?.dataUrl;
                     if (!originalSrc) return null;
                     
                     return (
                       <BeforeAfterSlider 
                          key={`slider-${sIdx}`}
                          beforeImage={originalSrc}
                          afterImage={imgSrc}
                       />
                     );
                   })}
                 </div>
               </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
