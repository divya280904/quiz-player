import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let db = null;
let useFirebase = false;

const hasFirebaseConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

try {
  if (hasFirebaseConfig) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    useFirebase = true;
  } else {
    console.warn('Firebase credentials missing in .env. Using LocalStorage fallback.');
  }
} catch (error) {
  console.warn('Firebase initialization failed. Using LocalStorage fallback.', error);
}

// LocalStorage backup functions
const getLocalLeaderboard = (quizId) => {
  try {
    const scores = JSON.parse(localStorage.getItem('quiz_leaderboard') || '[]');
    return scores
      .filter((s) => s.quizId === quizId)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return new Date(b.completedAt) - new Date(a.completedAt);
      })
      .slice(0, 10);
  } catch (e) {
    console.error('LocalStorage leaderboard read error:', e);
    return [];
  }
};

const saveLocalScore = (scoreData) => {
  try {
    const scores = JSON.parse(localStorage.getItem('quiz_leaderboard') || '[]');
    scores.push(scoreData);
    localStorage.setItem('quiz_leaderboard', JSON.stringify(scores));
  } catch (e) {
    console.error('LocalStorage leaderboard write error:', e);
  }
};

export async function saveScore(name, quizId, quizTitle, score, percentage) {
  const scoreData = {
    name,
    quizId,
    quizTitle,
    score: Number(score),
    percentage: Number(percentage),
    completedAt: new Date().toISOString(),
  };

  if (useFirebase && db) {
    try {
      await addDoc(collection(db, 'leaderboard'), scoreData);
      return { success: true, source: 'firebase' };
    } catch (error) {
      console.warn('Firestore write failed, falling back to LocalStorage:', error);
      saveLocalScore(scoreData);
      return { success: true, source: 'local_fallback' };
    }
  } else {
    saveLocalScore(scoreData);
    return { success: true, source: 'local' };
  }
}

export async function getLeaderboard(quizId) {
  if (useFirebase && db) {
    try {
      const q = query(
        collection(db, 'leaderboard'),
        where('quizId', '==', quizId),
        orderBy('score', 'desc'),
        orderBy('completedAt', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      // If Firestore works but has no data for this quiz, merge or fall back to local scores
      if (results.length > 0) {
        return results;
      }
      return getLocalLeaderboard(quizId);
    } catch (error) {
      console.warn('Firestore read failed, falling back to LocalStorage:', error);
      return getLocalLeaderboard(quizId);
    }
  } else {
    return getLocalLeaderboard(quizId);
  }
}
