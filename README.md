# ✨ Antigravity Webtoon Agency

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-latest-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss)
![Google AI](https://img.shields.io/badge/Google_Gemini_AI-enabled-4285F4?style=for-the-badge&logo=google)

**Yapay zeka destekli profesyonel Manhwa/Webtoon çeviri motoru.**

[🚀 Canlı Demo](#) · [🐛 Hata Bildir](https://github.com/Ahmetzdemir/antigravity-webtoon-agency/issues) · [✨ Özellik İste](https://github.com/Ahmetzdemir/antigravity-webtoon-agency/issues)

</div>

---

## ✨ Özellikler

| Özellik | Açıklama |
|---------|----------|
| 🌐 **URL Fetcher** | Doğrudan Webtoon URL'sinden bölüm çekme |
| 🤖 **AI Çevirisi** | Google Gemini AI ile bağlama duyarlı çeviri |
| 🎨 **Smart Typesetting** | Baloncuk boyutuna göre otomatik metin yerleşimi |
| 🖼️ **Piksel Hassasiyeti** | Gelişmiş inpainting ile kusursuz panel temizliği |
| ⚡ **Ultra Hızlı** | Dakikalar süren bölümleri saniyeler içinde işleme |
| 🔄 **Before/After Slider** | Orijinal ve çevrilmiş paneli karşılaştır |

---

## 🛠️ Teknoloji Yığını

- **Framework:** Next.js (App Router)
- **Dil:** TypeScript 5
- **Stil:** Tailwind CSS v4
- **Yapay Zeka:** Google Gemini AI (`@google/genai`)
- **Web Scraping:** Puppeteer
- **Animasyon:** Framer Motion
- **İkon:** Lucide React

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- Google Gemini API anahtarı

### 1. Repoyu klonlayın
```bash
git clone https://github.com/Ahmetzdemir/antigravity-webtoon-agency.git
cd antigravity-webtoon-agency
```

### 2. Bağımlılıkları yükleyin
```bash
npm install
```

### 3. Ortam değişkenlerini ayarlayın
`.env.local` dosyası oluşturun:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Geliştirme sunucusunu başlatın
```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

---

## 📁 Proje Yapısı

```
antigravity-webtoon-agency/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── fetch-url/      # URL'den panel çekme API'si
│   │   │   └── translate/      # Gemini AI çeviri API'si
│   │   ├── layout.tsx
│   │   └── page.tsx            # Ana arayüz
│   ├── components/
│   │   ├── UploadZone.tsx      # Görsel yükleme alanı
│   │   └── BeforeAfterSlider.tsx # Karşılaştırma kaydırıcısı
│   ├── lib/
│   │   ├── canvas-engine.ts    # Kanvas & inpainting motoru
│   │   ├── gemini.ts           # Gemini AI entegrasyonu
│   │   └── image-utils.ts      # Görüntü işleme yardımcıları
│   └── styles/
│       └── globals.css
└── .antigravity/               # AI skill konfigürasyonları
    └── skills/
        ├── IMAGE_PROCESSING_SKILL.md
        ├── SCRAPER_SKILL.md
        └── TRANSLATION_SKILL.md
```

---

## 💡 Kullanım

1. Uygulamayı açın
2. Manhwa/Webtoon görsel panellerini yükleyin **ya da** URL girin
3. AI otomatik olarak:
   - Metin balonlarını tespit eder
   - Metni temizler (inpainting)
   - Türkçe'ye çevirir
   - Baloncuklara yerleştirir
4. Before/After kaydırıcısı ile sonuçları karşılaştırın

---

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/harika-ozellik`)
3. Commit edin (`git commit -m 'feat: harika özellik ekle'`)
4. Push edin (`git push origin feature/harika-ozellik`)
5. Pull Request açın

---

## 📄 Lisans

MIT © [Ahmetzdemir](https://github.com/Ahmetzdemir)
