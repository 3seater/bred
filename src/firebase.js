import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, ref, push, onValue, serverTimestamp, set, onDisconnect } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyCB6omnew_cJmXoxvcV8WKA3vFwwgbl_Ic",
  authDomain: "bred-f2811.firebaseapp.com",
  databaseURL: "https://bred-f2811-default-rtdb.firebaseio.com",
  projectId: "bred-f2811",
  storageBucket: "bred-f2811.firebasestorage.app",
  messagingSenderId: "193516996282",
  appId: "1:193516996282:web:32a8b69c3f0bbfe1306483",
  measurementId: "G-1Z7RB1WCW8"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)

// ── Sign in anonymously, returns the uid ────────────────────────────
export async function anonSignIn() {
  const cred = await signInAnonymously(auth)
  return cred.user.uid
}

// ── Register presence — writes username+color to /users/:uid ────────
// Automatically removes on disconnect
export function registerPresence(uid, username, color) {
  const userRef = ref(db, `users/${uid}`)
  set(userRef, { username, color, online: true })
  onDisconnect(userRef).remove()
}

// ── Send a message ───────────────────────────────────────────────────
export function sendMessage(uid, username, color, text) {
  push(ref(db, 'messages'), {
    uid,
    username,
    color,
    text,
    ts: serverTimestamp(),
  })
}

// ── Subscribe to live messages (last 60) ────────────────────────────
export function subscribeMessages(callback) {
  const msgsRef = ref(db, 'messages')
  const unsub = onValue(msgsRef, (snapshot) => {
    const data = snapshot.val()
    if (!data) { callback([]); return }
    const msgs = Object.entries(data)
      .map(([id, m]) => ({ id, ...m }))
      .sort((a, b) => (a.ts || 0) - (b.ts || 0))
      .slice(-60)
    callback(msgs)
  })
  return unsub // call to unsubscribe
}

// ── Subscribe to online users ────────────────────────────────────────
export function subscribeUsers(callback) {
  const usersRef = ref(db, 'users')
  const unsub = onValue(usersRef, (snapshot) => {
    const data = snapshot.val()
    if (!data) { callback([]); return }
    callback(Object.values(data))
  })
  return unsub
}
