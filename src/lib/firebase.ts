import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

// Production Firebase Configuration for nbkrist-events-hub
const firebaseConfig = {
  apiKey: appletConfig.apiKey || "AIzaSyCtZro2n-g9yO7GXNVHWIAFVtd5NotD-3c",
  authDomain: appletConfig.authDomain || "nbkrist-events-hub.firebaseapp.com",
  projectId: appletConfig.projectId || "nbkrist-events-hub",
  storageBucket: appletConfig.storageBucket || "nbkrist-events-hub.firebasestorage.app",
  messagingSenderId: appletConfig.messagingSenderId || "402455512554",
  appId: appletConfig.appId || "1:402455512554:web:9ff5e64db5786bb5b8de93",
  firestoreDatabaseId: '(default)'
};

// Ensure exactly one Firebase app instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore using (default) database with auto-detect long polling for cloud container stability
export const db = (() => {
  try {
    return initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch {
    return getFirestore(app);
  }
})();

// Firebase Authentication using the same app instance
export const auth = getAuth(app);

// Connection test as required by skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection check: client is offline or configuration pending.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default app;
