# AlgoBIST - AI Destekli Borsa Terminali

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

![AlgoBIST Ekran Görüntüsü](ekran-goruntusu-linki-buraya)

## Harika Bir Finansal Deneyim: AlgoBIST Hakkında

**AlgoBIST**, Borsa İstanbul (BİST) hisseleri için canlı veri, gelişmiş teknik indikatörler ve Google Gemini Yapay Zeka modeli ile anlık yorum üreten modern bir finansal karar destek sistemidir. Geleneksel karmaşık borsa terminallerine kıyasla, AlgoBIST hem yeni başlayanların hem de profesyonellerin kolayca okuyup analiz edebileceği sade, şık ve neon-koyu temalı bir arayüz (UI) sunar. 

## 🚀 Temel Özellikler

*   🧠 **Yapay Zeka Analizi:** Gemini AI ile anlık temel ve teknik hisse yorumlaması. Verilerin analize dökülmüş, okunabilir Markdown hali.
*   📊 **Gelişmiş Grafikler:** TradingView kalitesinde Lightweight Charts entegrasyonu ile akıcı, dinamik ve birden fazla panelden oluşan fiyat hareket grafikleri.
*   📈 **Profesyonel İndikatörler:** RSI, MACD, Bollinger Bantları, SMA (20, 50) ve Hacim (Volume) barları; üstelik tüm bu indikatörler anında toggle (aç/kapat) ile görünürlük kazanabilir.
*   🔍 **Akıllı Arama:** 500'den fazla BİST hissesini tam şirket adıyla ve hisse koduyla saniyeler içinde zeki arama yeteneği.
*   ⚖️ **Yasal Uyumluluk:** SPK standartlarına uygun "Yatırım Tavsiyesi Değildir" (YTD) uyarı modalleri ve kalıcı footer entegrasyonu.

## 💻 Teknoloji Yığını (Tech Stack)

### Frontend
- **Framework:** Next.js (App Router), React
- **Stil & Tasarım:** Tailwind CSS
- **Grafik Motoru:** Lightweight Charts (TradingView)
- **Komponent:** React Markdown

### Backend
- **Core:** Python, FastAPI
- **Veri Sağlayıcı:** YFinance (Yahoo Finance API)
- **Yapay Zeka:** Google Generative AI (Gemini)
- **Veri İşleme:** Pandas

---

## 🛠️ Kurulum ve Çalıştırma (Installation)

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz. Her iki katmanı (Frontend ve Backend) da eş zamanlı ayağa kaldırmanız gerekecektir.

### 1. Depoyu Klonlayın

```bash
git clone https://github.com/kullanici-adiniz/algobist.git
cd algobist
```

### 2. Backend Kurulumu ve Başlatılması

Python yüklü olmalıdır (Python 3.9+ önerilir). Backend dizinine gidin, kütüphaneleri yükleyin ve sunucuyu başlatın:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

*Sunucu varsayılan olarak `http://127.0.0.1:8000` adresinde çalışacaktır.*

*(Not: Ortam değişkenleri/gizli anahtarlar için `.env` dosyasında `GEMINI_API_KEY` vb. değerlerinizi ayarlamanız gerektiğini unutmayın.)*

### 3. Frontend Kurulumu ve Başlatılması

Yeni bir terminal penceresinde frontend dizinine gidin, Node paketlerini kurun ve uygulamanızı çalıştırın:

```bash
cd frontend
npm install
npm run dev
```

*Uygulama `http://localhost:3000` adresinde yayına girecektir.*

---

## 👨‍💻 Geliştirici (Developer)

**Geliştirici:** Muhammed Cengiz  
**Portfolyo Web Sitesi:** [muhammedcengiz.com](https://muhammedcengiz.com)  
**Lisans:** MIT
