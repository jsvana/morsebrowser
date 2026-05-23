import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'

// Firebase web config is NOT secret — it ships in the client by design.
// Security comes from Realtime Database rules + (later) App Check.
export const firebaseConfig = {
  apiKey: 'AIzaSyB9AD9c46PD2MLoRhw1erCSGtOJJ41gkVI',
  authDomain: 'morse-practice-page.firebaseapp.com',
  // TODO: paste this from the Firebase console AFTER creating the Realtime Database.
  // It looks like https://morse-practice-page-default-rtdb.firebaseio.com
  // (or ...-default-rtdb.<region>.firebasedatabase.app for non-US regions).
  databaseURL: '',
  projectId: 'morse-practice-page',
  storageBucket: 'morse-practice-page.firebasestorage.app',
  messagingSenderId: '1039177412775',
  appId: '1:1039177412775:web:79b0e592c07426abc1ab82'
}

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getDatabase(firebaseApp)
export const auth = getAuth(firebaseApp)
