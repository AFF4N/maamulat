# معمولات | Maamulat — Daily Spiritual Sheet

> **A private, offline-first personal Tazkiyah & Maamulat companion.**  
> Track daily worship, build steadfastness (*Istiqaamah*), calculate Hasanat, and share progress with your spiritual mentor (*Murrabi*) or accountability partner.

[![Offline First](https://img.shields.io/badge/Offline-First-2e7d32?style=flat-square)](#privacy--offline-first)
[![Zero Backend](https://img.shields.io/badge/Backend-Zero%20Servers-blue?style=flat-square)](#privacy--offline-first)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple?style=flat-square)](#progressive-web-app-pwa)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](#tech-stack)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](#tech-stack)

---

## 🌿 Overview

In traditional Islamic spiritual mentorship (*Tazkiyah* / *Tasawwuf*), seekers maintain a daily spiritual sheet (**معمولات / Ma'amulat**) to account for their prayers, Sunan, recitation, and dhikr before their Creator, regularly reviewing it with a mentor (*Murrabi* or *Sheikh*).

**Maamulat** digitizes this timeless practice into a modern, serene web application designed to be:
- **Distraction-Free**: Warm linen & botanical paper aesthetics with a soothing dark mode.
- **Strictly Private**: 100% client-side `localStorage`. No logins, no tracking, no cloud databases.
- **Accountability-Ready**: Generates the exact authentic WhatsApp report formatted for sending to your Murrabi with one tap.

---

## ✨ Features

### 1. 🕌 Five Daily Prayers & Takbeer-e-Oola
- Track Fajr, Zuhr, Asr, Maghrib, and Isha in congregation (*Ba-Jama'at*).
- Interactive stepper counter for **Takbeer-e-Oola** (0 to 5) achieved each day.

### 2. 🟢 Sunan & Adab
- Daily Sunnah practices including **Miswak** with step-by-step guidance on tareeqa, Sunnah timings, and the 70x prayer reward multiplication according to Hadith.

### 3. 📖 Qur'an Recitation & Customizable Tilawat
- Daily Surahs: **Surah Yaseen**, **Surah Waqi'ah**, and **Surah Mulk**.
- **Variable Tilawat Measure**: Quick presets for **ایک رکوع** (1 Ruku), **ایک پاؤ** (1/4 Juz), **آدھا پارہ** (Half Juz), **1 پارہ**, **2 پارے**, **3 پارے**, or custom portions that automatically adapt in the WhatsApp report.

### 4. 🔴 Morning & Evening Dhikr (100x Daily)
- **Morning Dhikr**: 100x Istighfar, 100x Durood Sharif, 100x 3rd Kalimah, 100x 1st Kalimah.
- **Evening Dhikr**: 100x Istighfar, 100x Durood Sharif, 100x 3rd Kalimah, 100x 1st Kalimah.

### 5. 🟩 Nawafil Prayers (Voluntary Worship)
- **Tahajjud**, **Ishraq**, **Chasht**, and **Awwabin**.
- Dedicated info tooltips `(i)` explaining prayer timings, number of rak'ahs, tareeqa, and Hadith virtues.

### 6. 🤲 Du'as & Munajat-e-Faqeer
- Post-Tahajjud du'a remembrance.
- **Munajat-e-Faqeer**: Direct PDF download and reading link.

### 7. 🛡️ حفاظتِ جوارح و اعضاء (Guarding the Limbs)
- **زبان کی حفاظت (Tongue)**: Abstaining from backbiting (*Gheebah*), lies, harsh speech, and futile talk.
- **نظروں کی حفاظت (Eyes)**: Lowering gaze from unlawful sights and harmful digital screens.
- **کانوں کی حفاظت (Ears)**: Guarding against hearing slander, gossip, or prohibited content.

### 8. 🟤 Sleep & Wake Log
- Log night sleep and morning wake timings with seasonal quick-select chips adapted for Tahajjud and Fajr routines.

### 9. 🤝 Murrabi Accountability & WhatsApp Report
- One-click copy or direct **WhatsApp export** formatted with traditional Tazkiyah symbols:
  ```text
  السلام علیکم ورحمۃ اللہ وبرکاتہ
  *ہدف یوم:* 12/40
  *تاریخ:* 04 اکتوبر 2026
  ...
  🔹تلاوت ( 1 پارہ ) ✅
  ...
  ```
- **Custom Mentor Link**: Pre-fill your mentor's WhatsApp phone number via URL query:
  ```text
  https://your-domain.com/?murrabi=+923001234567
  ```
- **"Why a Murrabi?" Guide**: Built-in modal clarifying the purpose of spiritual mentorship and guarding against Shaytanic doubts (*Waswasah*).

### 10. 🎯 Spiritual Goal & Consistency Streak
- Customizable target days: **7, 21, 40, or 100 days** (or custom duration).
- Daily Hasanat points counter with soft celebratory micro-animations.
- 7-day visual history timeline showing daily consistency.

---

## 🔒 Privacy & Offline-First

Your worship and spiritual struggles are strictly between you and Allah:
- **No Cloud Database**: Data never leaves your personal browser.
- **No Analytics / No Tracking**: No Google Analytics, cookies, or user profiling.
- **Full Offline Operation**: Completely accessible and functional without an active internet connection.

---

## 📱 Progressive Web App (PWA)

Install Maamulat as a standalone app on your mobile device or desktop:
- **iOS (Safari)**: Tap the Share button → **Add to Home Screen**.
- **Android (Chrome)**: Tap the menu (three dots) → **Install App** / **Add to Home screen**.
- **Desktop (Chrome/Edge)**: Click the Install icon in the address bar.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Google Fonts (*Amiri*, *Noto Naskh Arabic*, *Plus Jakarta Sans*, *Fraunces*)
- **Animations**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **PWA**: Service Worker caching + Web App Manifest

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aff4n/maamulat.git
   cd maamulat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```
   The production-optimized bundle will be created in the `dist/` directory.

---

## 🌐 Deployment

Deploy effortlessly to any static hosting platform:

- **Vercel**: Import the GitHub repo; framework preset is automatically detected as Vite.
- **Netlify**: Set build command to `npm run build` and publish directory to `dist`.
- **Cloudflare Pages**: Connect repo, set build command to `npm run build`, output directory `dist`.
- **GitHub Pages**: Build and deploy the `dist/` folder via GitHub Actions.

---

## 🤲 Du'a & Acknowledgement

Developed with ❤️ by **[Affan Ahmed](https://github.com/aff4n)**.

If this application benefits you in maintaining consistency upon your daily Ma'amulat, please remember the developer and their family in your sincere prayers (*du'as*).

> *«أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»*  
> *"The deeds most loved by Allah are those done regularly, even if they are few."* — (Sahih Muslim)

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
