# Mera Chunaav — Your Vote, Your Story 🇮🇳

![Mera Chunaav](https://firebasestorage.googleapis.com/v0/b/mera-chunaav.firebasestorage.app/o/home-animation%2FFinger_transforms_into_202604270019_079.jpg?alt=media)

## 📌 Overview
**Mera Chunaav** is a dynamic, AI-powered civic platform designed to provide a premium, engaging experience for Indian voters. Moving away from dense, text-heavy government portals, it offers a narrative-driven "Election Journey." The platform blends interactive visual storytelling with cutting-edge Google Cloud integration to make civic data accessible, personalized, and visually stunning.

---

## 🎯 1. Chosen Vertical: Voter Education & Gen-Z Engagement
We chose the **Voter Education & Engagement** vertical, specifically targeting first-time voters and the Gen-Z demographic. 
Traditional election websites suffer from high bounce rates due to overwhelming data dumps. Mera Chunaav solves this by transforming civic duty into an interactive digital experience. By gamifying voter knowledge (Civic Quizzes), providing a personalized election timeline (Journey), and offering an AI conversational guide, we drastically lower the barrier to entry for understanding local elections.

---

## 🧠 2. Approach and Logic
Our architectural and design decisions were strictly driven by the hackathon's core evaluation criteria:

* **Design Philosophy ("Civic Luxury"):** We implemented a bespoke design system featuring a warm golden-chestnut palette, glassmorphism UI, and `Plus Jakarta Sans` typography. This creates a highly trusted, premium feel that encourages users to explore the data.
* **Performance-First Architecture (Efficiency):** Instead of relying on heavy frontend frameworks (like React/Next.js) which introduce unnecessary bundle bloat for a static SPA, we built the core engine entirely in Vanilla JavaScript.
* **Scroll-Triggered Storytelling:** To hook the user immediately, the homepage features a 60-frame HTML5 Canvas animation (Person → Inked Finger → India Map). To ensure **optimal use of resources**, the image sequence is offloaded to a Firebase Storage CDN, bringing the core repository size down to less than 1MB.

---

## ⚙️ 3. How the Solution Works (Google Services Integration)

Mera Chunaav demonstrates a deeply integrated stack of Google ecosystem tools, ensuring robust **Security**, **Efficiency**, and **Accessibility**:

1. **Google Gemini AI (Smart Assistant):** 
   * A conversational AI guide is embedded directly into the application. It provides context-aware answers regarding constituencies, candidate backgrounds, and voting procedures.
2. **Google Cloud Text-to-Speech (Accessibility):** 
   * To ensure an **inclusive and usable design**, the platform utilizes the Google Cloud TTS API. It intelligently selects premium `Wavenet` voices (`hi-IN-Wavenet-A` and `en-IN-Wavenet-C`) based on the user's localized language toggle, allowing visually impaired users to listen to civic information dynamically.
3. **Firebase Ecosystem (Security & State):**
   * **Firebase Storage:** Acts as a high-speed CDN to serve the massive 60-frame scroll animation sequence, keeping the application lightweight.
   * **Firebase Anonymous Auth:** Ensures safe, frictionless session tracking without requiring users to hand over personal PII (Personally Identifiable Information).
   * **Firestore:** securely stores and manages the user's "Civic Quiz" scores and progress.

---

## 🤔 4. Assumptions Made
During development, the following assumptions were made to scope the solution:
1. **Modern Browser Availability:** We assume users are operating on modern mobile or desktop browsers supporting HTML5 `<canvas>`, ES6 JavaScript, and CSS Grid/Flexbox layouts.
2. **Connectivity:** As the AI guide and Text-to-Speech features rely on Google Cloud endpoints, an active internet connection is assumed for the full experience. Offline fallback logic exists to handle dropped connections gracefully.
3. **Data Availability:** Constituency data and candidate profiles are simulated/mocked for the purpose of the prototype, assuming an official API integration would replace the `Dataset.json` in a production environment.

---

## 🚀 Deployment & Tech Stack
* **Frontend:** HTML5, CSS3 (Custom Design System), Vanilla JS (ES6+)
* **Cloud/Backend:** Google Firebase (Auth, Firestore, Storage), Google Cloud Run
* **AI & APIs:** Gemini 2.0 API, Google Cloud Text-to-Speech API
* **Containerization:** Configured with a lightweight Nginx `Dockerfile` for effortless, scalable deployment to **Google Cloud Run**.
