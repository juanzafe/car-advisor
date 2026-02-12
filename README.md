# 🏎️ Car Advisor Pro: Professional Vehicle Comparison Hub

**Live Project:** [caradvisorpro.es](https://caradvisorpro.es)

Car Advisor Pro is a professional vehicle search and comparison platform designed to stop users from jumping between dozens of manufacturer websites. It centralizes technical specifications and visual data into one intuitive interface, enabling data-driven decisions during the car-buying process.

<p align="center">
  <img src="src/assets/Animationcaradvisor.gif" alt="Car Advisor Pro Demo" width="600">
</p>

---

## 🌟 The Problem & The Solution

The car market is fragmented. Comparing a Toyota to a Hyundai usually involves multiple tabs, inconsistent technical units, and marketing fluff.

I built this tool to provide a **"Single Source of Truth."** Users can compare vehicles from different brands side-by-side, analyzing both raw specifications and visual designs in one place.

### 🚀 Core Features

- **Side-by-Side Comparison:** Compare technical specs (engine, dimensions, fuel efficiency) and aesthetics directly. No more switching tabs; everything is aligned for a clear comparison.
- **Data Normalization Engine:** One of the project's biggest challenges was merging inconsistent data. I developed custom algorithms to sanitize data from **API Ninjas** and **NHTSA vPIC**, ensuring the UI remains clean and unified regardless of the source.
- **Bilingual Support:** To reach a global audience, the app is fully localized in **English and Spanish**.
- **Global Search:** A unified search bar that allows users to find specific models and trims instantly without navigating deep menus.

---

## 📈 Technical Highlights & DevOps

This project serves as a showcase for modern development workflows and data integrity:

- **Automated CI/CD Pipeline:** I implemented a fully automated deployment cycle using **GitHub Actions**. Every push to `main` is automatically tested and deployed to **Firebase Hosting**, ensuring that updates reach users without downtime or manual errors.
- **Scalable Architecture:** Built with a strict **TypeScript** foundation. By using custom interfaces and types, I've minimized runtime errors and ensured the codebase is maintainable as new data sources are integrated.
- **Optimized UX:** Designed with a "Mobile First" approach using **Tailwind CSS**, including AdSense-ready layouts and a custom cookie consent system for privacy compliance.

---

## 🛠️ Tech Stack

- **Frontend:** `React 18`, `TypeScript`, `Tailwind CSS`.
- **Backend & DevOps:** `Firebase (Hosting & Firestore)`, `GitHub Actions`.
- **Tools:** `Vite`, `Lucide Icons`, `Headless UI`.
- **APIs:** `API Ninjas`, `NHTSA vPIC`.

---

## ⚙️ Installation & Setup

1. **Clone & Install:**
   ```bash
   git clone [https://github.com/juanzafe/car-advisor-pro.git](https://github.com/juanzafe/car-advisor-pro.git)
   ```
2. **Install dependencies:** `npm install`
3. **Environment Variables:** Add your VITE_FIREBASE_API_KEY and VITE_NINJA_API_KEY to a .env file.
4. **Run Development Mode:** `npm run dev`

**Developed by Juan Zamudio – Real solutions for everyday professional problems.**
