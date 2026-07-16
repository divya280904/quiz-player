# QuizSphere - Responsive React.js Quiz Player

QuizSphere is a high-performance, premium, responsive React.js Quiz Player application built using React, React Router, Tailwind CSS, Framer Motion, and Firebase Firestore.

## Features

- **Dynamic Quiz Listing**: Categorized cards with difficulty indicators, question counts, and duration-per-question metrics.
- **Advanced Configurations**: Toggleable shuffling options (Shuffle Questions and Shuffle Options) before starting any quiz.
- **Immersive Quiz Player**:
  - Live progress tracking bar.
  - Interactive circular timer with critical countdown pulse and ticking sounds.
  - Full keyboard shortcuts (keys `A`, `B`, `C`, `D` or `1`, `2`, `3`, `4` to choose; `Enter`/`Space` to proceed; `Esc` to quit).
  - Transition animations between questions.
- **Rich Audio & Visual Feedback**:
  - Synthesized Web Audio API correct/incorrect chimes (no dependencies/assets to load).
  - Canvas-confetti rewards on high accuracy (80%+).
- **Result Dashboard**:
  - Detailed score and accuracy metric ring.
  - Interactive questionnaire overview (collapsible accordion showing correct answers and explanations).
- **Firebase Leaderboard Integration**:
  - Automatically submits player scores to a centralized Firestore collection.
  - Robust offline-first design: syncs to `LocalStorage` if Firestore is offline or credentials are missing.
  - Displays top 10 scores sorted by score (descending) and latest completion date.

---

## AI Usage Disclosure

- **AI Tools Used**: Developed in collaboration with Antigravity, Google DeepMind's agentic coding assistant.
- **Where AI Helped**:
  - Automated package setup and configurations for Tailwind CSS v3 and PostCSS.
  - Scaffolding the React components (`QuizPlayer`, `ResultScreen`, `Leaderboard`).
  - Synthesized Web Audio API sound generation.
  - Implementation of local storage fallback mechanisms.
- **What Was Implemented Manually**:
  - Designing the custom glassmorphism visual styles and typography pairings.
  - Aligning keyboard shortcut listeners and managing clean react states for shufflers.
  - Writing structural DOM markups and reviewing responsive parameters down to 320px mobile screens.

---

## Tech Stack

- **Framework**: React.js (Vite template)
- **Styling**: Tailwind CSS v3 & PostCSS
- **State Management**: React state hooks and Context API (for Dark/Light theme toggles)
- **Routing**: React Router (`react-router-dom`)
- **Animations**: Framer Motion
- **Database**: Firebase Firestore (for public leaderboard tracking)

---

## Setup & Running Locally

### 1. Prerequisites
Make sure you have Node.js (version 18 or above) installed.

### 2. Install Dependencies
Navigate into the `app/` folder and install packages:
```bash
cd app
npm install
```

### 3. Run Development Server
Start the local server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Firestore Security Rules
Ensure your Firestore collection `leaderboard` is readable and writable. You can set the following rules in your Firebase console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{document} {
      allow read, write: if true; // Modify rules according to production security policies
    }
  }
}
```
