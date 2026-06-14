import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup as fbSignInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  Auth
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const metaEnv = (import.meta as any).env || {};
const apiKey = metaEnv.VITE_FIREBASE_API_KEY;
const authDomain = metaEnv.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = metaEnv.VITE_FIREBASE_PROJECT_ID;
const storageBucket = metaEnv.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = metaEnv.VITE_FIREBASE_APP_ID;
const firestoreDatabaseId = metaEnv.VITE_FIREBASE_DATABASE_ID || "";

export const isFirebaseConfigured = !!(apiKey && projectId && appId);

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

let app: any = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firestoreDatabaseId || undefined);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.error("Firebase network/initialization error:", err);
  }
}

export { db, auth, googleProvider };

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentUid = auth ? auth.currentUser?.uid : null;
  const currentEmail = auth ? auth.currentUser?.email : null;
  const currentEmailVerified = auth ? auth.currentUser?.emailVerified : null;
  const currentIsAnonymous = auth ? auth.currentUser?.isAnonymous : null;
  const currentTenantId = auth ? auth.currentUser?.tenantId : null;
  const currentProviderData = auth ? auth.currentUser?.providerData : [];

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUid,
      email: currentEmail,
      emailVerified: currentEmailVerified,
      isAnonymous: currentIsAnonymous,
      tenantId: currentTenantId,
      providerInfo: currentProviderData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Robust, friendly Google Authentication helper wrappers
export async function signInWithPopupWrapper(): Promise<any> {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    const error: any = new Error("Firebase configuration not found. Please setup environment variables.");
    error.code = "auth/configuration-not-found";
    throw error;
  }
  try {
    return await fbSignInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("Firebase Auth Failure logged safely:", error.code || error.message);
    throw error;
  }
}

export async function signOutWrapper(): Promise<void> {
  if (!auth) return;
  await fbSignOut(auth);
}

export function onAuthStateChangedWrapper(callback: (user: any) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return fbOnAuthStateChanged(auth, callback);
}

// Friendly translates for Firebase Auth errors
export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/configuration-not-found":
      return "Firebase integration is not fully configured. Please configure environmental settings (PROJECT JID, API KEY, etc.) in settings.";
    case "auth/unauthorized-domain":
      return "Security Block: This hosting domain is not authorized in the Firebase console OAuth redirect list.";
    case "auth/popup-closed-by-user":
      return "Authentication aborted: The login modal popped up but was closed prior to authentication.";
    case "auth/network-request-failed":
      return "Network failure: Communication with Google Authentication services timed out or was blocked.";
    default:
      return "Authentication failed due to an unexpected Firebase connection state. Try again.";
  }
}
