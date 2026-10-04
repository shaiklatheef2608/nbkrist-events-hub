import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { HostProfile } from '../types';
import { APPROVED_HOSTS, HOST_METADATA } from '../utils/constants';

interface AuthContextType {
  user: User | null;
  hostProfile: HostProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; organization?: string; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; organization?: string; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; organization?: string; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Verifies authenticated user against approvedHosts/{email}, reads the approved host doc,
 * and creates hosts/{uid} automatically with uid, email, organization, hostType, createdAt if not present.
 */
async function verifyAndCreateHostProfile(firebaseUser: User): Promise<HostProfile | null> {
  const normalizedEmail = (firebaseUser.email || '').toLowerCase().trim();
  if (!normalizedEmail) return null;

  // 1. Verify authenticated user email against approved hosts whitelist
  const mappedOrgFromConfig = APPROVED_HOSTS[normalizedEmail];
  if (!mappedOrgFromConfig) {
    console.warn(`Email ${normalizedEmail} is not authorized in approved hosts registry.`);
    return null;
  }

  let organization = mappedOrgFromConfig;
  let hostType = HOST_METADATA[organization]?.type || 'Department';

  // Read the approved host document from approvedHosts/{email}
  const approvedDocRef = doc(db, 'approvedHosts', normalizedEmail);
  try {
    const approvedSnap = await getDoc(approvedDocRef);
    if (approvedSnap.exists()) {
      const data = approvedSnap.data();
      if (data.organization) organization = data.organization;
      if (data.hostType) hostType = data.hostType;
    }
  } catch (err: any) {
    console.warn("Notice checking approvedHosts in Firestore; applying verified institutional configuration:", err?.message || err);
  }

  // 2. Check if hosts/{uid} already exists
  const hostDocRef = doc(db, 'hosts', firebaseUser.uid);
  let existingProfile: HostProfile | null = null;
  try {
    const hostSnap = await getDoc(hostDocRef);
    if (hostSnap.exists()) {
      const existing = hostSnap.data() as HostProfile;
      existingProfile = {
        uid: firebaseUser.uid,
        email: normalizedEmail,
        organization: existing.organization || organization,
        hostType: existing.hostType || hostType,
        approved: existing.approved ?? true,
        createdAt: existing.createdAt
      };
    }
  } catch (err: any) {
    console.warn("Notice checking hosts document in Firestore:", err?.message || err);
  }

  if (existingProfile) {
    return existingProfile;
  }

  // 3. Create hosts/{uid} automatically:
  // - uid: authenticated user UID
  // - email: authorized collegiate email
  // - organization: assigned institutional organization
  // - hostType: Department / Student Chapter / Cell
  // - createdAt: server timestamp
  const hostPayload = {
    uid: firebaseUser.uid,
    email: normalizedEmail,
    organization: organization,
    hostType: hostType,
    approved: true,
    createdAt: serverTimestamp()
  };

  try {
    await setDoc(hostDocRef, hostPayload);
    console.log(`Host profile document automatically created in Firestore at: hosts/${firebaseUser.uid}`);
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('permission-denied')) {
      handleFirestoreError(err, OperationType.CREATE, `hosts/${firebaseUser.uid}`);
    } else {
      console.warn("Notice writing host profile document to Firestore:", err?.message || err);
    }
  }

  return {
    uid: firebaseUser.uid,
    email: normalizedEmail,
    organization: organization,
    hostType: hostType,
    approved: true,
    createdAt: new Date().toISOString()
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync host profile when user authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        try {
          const profile = await verifyAndCreateHostProfile(currentUser);
          setHostProfile(profile);
        } catch (error) {
          console.error("Error verifying host profile on auth state change:", error);
          setHostProfile(null);
        }
      } else {
        setHostProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Step 1: Pre-verify against approved hosts
      if (!APPROVED_HOSTS[normalizedEmail]) {
        return {
          success: false,
          error: "This email is not authorized to register or login as an event host. Please use your officially approved NBKRIST host email."
        };
      }

      // Step 2: Sign in with Firebase Email/Password
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);

      // Step 3: Verify approvedHosts & automatically create hosts/{uid} if missing
      const profile = await verifyAndCreateHostProfile(cred.user);
      if (!profile) {
        return {
          success: false,
          error: "Unable to verify host credentials against approvedHosts."
        };
      }

      setHostProfile(profile);
      return { success: true, organization: profile.organization };
    } catch (err: any) {
      console.warn("Host login error:", err?.code || err?.message || err);
      let message = err?.message || "Invalid email or password. Please verify your credentials.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = "Incorrect password or email combination. Verify credentials and try again.";
      } else if (err.code === 'auth/too-many-requests') {
        message = "Access temporarily disabled due to multiple failed login attempts. Please reset your password or try again later.";
      } else if (err.message && err.message.includes('permission-denied')) {
        message = "Firestore permission error: Access denied to host records. Check database rules.";
      }
      return { success: false, error: message };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Step 1: Pre-verify against approved hosts
      if (!APPROVED_HOSTS[normalizedEmail]) {
        return {
          success: false,
          error: "This email is not authorized to register as an event host. Please use your officially approved NBKRIST host email."
        };
      }

      // Step 2: Create user directly with Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

      // Step 3: Read approved host doc and create hosts/{uid}
      const profile = await verifyAndCreateHostProfile(cred.user);
      if (!profile) {
        return {
          success: false,
          error: "Failed to initialize host document in Firestore."
        };
      }

      setHostProfile(profile);
      return { success: true, organization: profile.organization };
    } catch (err: any) {
      console.warn("Host registration error:", err?.code || err?.message || err);
      let message = err?.message || "Host registration failed. Please verify your details.";
      if (err.code === 'auth/email-already-in-use') {
        message = "An account already exists for this approved host email. Please sign in instead.";
      } else if (err.code === 'auth/weak-password') {
        message = "Password should be at least 6 characters long.";
      } else if (err.code === 'auth/invalid-email') {
        message = "Invalid email format. Please check the address entered.";
      } else if (err.message && err.message.includes('permission-denied')) {
        message = "Firestore permission error: Access denied to create host record.";
      }
      return { success: false, error: message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const email = cred.user.email?.toLowerCase().trim() || '';

      if (!APPROVED_HOSTS[email]) {
        await signOut(auth);
        return {
          success: false,
          error: `Google Account (${email}) is not authorized as an NBKRIST host organizer. Please sign in with an authorized departmental address or administrator account.`
        };
      }

      const profile = await verifyAndCreateHostProfile(cred.user);
      if (!profile) {
        return {
          success: false,
          error: "Failed to initialize host profile in Firestore."
        };
      }

      setHostProfile(profile);
      return { success: true, organization: profile.organization };
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.warn("Notice: Google sign-in status:", err.code);
      } else {
        console.warn("Notice: Google sign-in issue:", err);
      }
      let message = "Google Sign-In failed.";
      if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
        message = `Firebase error (auth/unauthorized-domain): This domain (${domain}) is not authorized in Firebase Console > Authentication > Settings > Authorized domains.`;
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = "Sign-in popup was closed before completing.";
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = "Sign-in request was cancelled.";
      } else if (err.code === 'auth/popup-blocked') {
        message = "Sign-in popup was blocked by your browser. Please allow popups for this site.";
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setHostProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      if (!APPROVED_HOSTS[normalizedEmail]) {
        return {
          success: false,
          error: "The provided email is not an authorized NBKRIST host email address."
        };
      }
      await sendPasswordResetEmail(auth, normalizedEmail);
      return { success: true };
    } catch (err: any) {
      console.error("Password reset error:", err);
      let message = "Unable to send password reset email. Please try again.";
      if (err.code === 'auth/user-not-found') {
        message = "No account found for this host email. Please register first.";
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, hostProfile, loading, login, register, loginWithGoogle, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
