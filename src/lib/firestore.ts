import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  NBKRISTEvent, 
  EventStatus,
  RegistrationFormDefinition,
  EventRegistration,
  FormSection,
  FormQuestion,
  LogicRule,
  PaymentSettings
} from '../types';
import { APPROVED_HOSTS, HOST_METADATA } from '../utils/constants';

const EVENTS_COLLECTION = 'events';
const APPROVED_HOSTS_COLLECTION = 'approvedHosts';
const FORMS_SUBCOLLECTION = 'registrationForms';
const REGISTRATIONS_SUBCOLLECTION = 'registrations';

/**
 * Realtime subscription to all published/visible institutional events
 */
export function subscribeToPublishedEvents(
  callback: (events: NBKRISTEvent[]) => void,
  errorCallback?: (error: any) => void
) {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('status', 'in', ['published', 'registration_open', 'registration_closed', 'completed', 'cancelled'])
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const events: NBKRISTEvent[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as NBKRISTEvent;
        // Publicly visible statuses
        if (['published', 'registration_open', 'registration_closed', 'completed', 'cancelled'].includes(data.status)) {
          events.push({
            ...data,
            eventId: docSnap.id
          });
        }
      });
      // Sort upcoming by date ascending
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      callback(events);
    },
    (error) => {
      console.warn("Firestore events subscription notice:", error?.message || error);
      if (errorCallback) {
        errorCallback(error);
      }
    }
  );
}

/**
 * Realtime subscription to events owned by the authenticated host
 */
export function subscribeToHostEvents(
  hostUid: string,
  callback: (events: NBKRISTEvent[]) => void,
  errorCallback?: (error: any) => void
) {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('createdBy', '==', hostUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const events: NBKRISTEvent[] = [];
      snapshot.forEach((docSnap) => {
        events.push({
          ...(docSnap.data() as NBKRISTEvent),
          eventId: docSnap.id
        });
      });
      events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(events);
    },
    (error) => {
      console.warn("Firestore host events subscription notice:", error?.message || error);
      if (errorCallback) {
        errorCallback(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, EVENTS_COLLECTION);
      }
    }
  );
}

/**
 * Fetch a single event by ID
 */
export async function getEventById(eventId: string): Promise<NBKRISTEvent | null> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    return {
      ...(snap.data() as NBKRISTEvent),
      eventId: snap.id
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${EVENTS_COLLECTION}/${eventId}`);
  }
}

/**
 * Create a new event under host organization
 */
export async function createInstitutionalEvent(
  eventData: Omit<NBKRISTEvent, 'eventId' | 'createdBy' | 'createdAt' | 'updatedAt'>,
  hostUid: string,
  hostOrg: string
): Promise<string> {
  const newDocRef = doc(collection(db, EVENTS_COLLECTION));
  const eventId = newDocRef.id;

  const payload: NBKRISTEvent = {
    ...eventData,
    eventId,
    createdBy: hostUid,
    organization: hostOrg, // Enforce host organization
    organizationId: hostOrg.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(newDocRef, payload);
    return eventId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${EVENTS_COLLECTION}/${eventId}`);
  }
}

/**
 * Update an existing event (verifies owner matches in security rules)
 */
export async function updateInstitutionalEvent(
  eventId: string,
  eventData: Partial<NBKRISTEvent>,
  hostUid: string
): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  try {
    // Immutable properties
    const safeData = { ...eventData };
    delete (safeData as any).createdBy;
    delete (safeData as any).organization;
    delete (safeData as any).createdAt;

    await updateDoc(docRef, {
      ...safeData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${EVENTS_COLLECTION}/${eventId}`);
  }
}

/**
 * Update status of an event
 */
export async function updateEventStatus(
  eventId: string,
  status: EventStatus
): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  try {
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${EVENTS_COLLECTION}/${eventId}`);
  }
}

/**
 * Delete an event
 */
export async function deleteInstitutionalEvent(eventId: string): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${EVENTS_COLLECTION}/${eventId}`);
  }
}

/**
 * Seed approvedHosts collection if it doesn't exist yet
 */
export async function ensureApprovedHostsSeeded(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, APPROVED_HOSTS_COLLECTION));
    if (snap.empty) {
      for (const [email, orgName] of Object.entries(APPROVED_HOSTS)) {
        const hostMeta = HOST_METADATA[orgName];
        await setDoc(doc(db, APPROVED_HOSTS_COLLECTION, email), {
          email,
          organization: orgName,
          approved: true,
          hostType: hostMeta?.type || 'Department'
        });
      }
    }
  } catch (e) {
    // Non-blocking if security rules prevent client write to approvedHosts
    console.debug("Approved hosts check completed.");
  }
}

/**
 * Creates a sensible default registration form structure for an event
 */
export function getDefaultRegistrationForm(eventId: string, eventTitle: string, hostUid: string): RegistrationFormDefinition {
  const section1Id = 'section-personal';
  return {
    formId: 'current',
    eventId,
    title: `${eventTitle} - Registration`,
    description: 'Please complete the required details below to register for this official NBKRIST collegiate event.',
    version: 1,
    status: 'published',
    allowDuplicateRegistration: false, // Enforce one registration per participant
    capacityLimit: 200,
    sections: [
      {
        id: section1Id,
        title: 'Participant & Academic Details',
        description: 'Primary institutional identification for delegate passes.',
        displayOrder: 1
      }
    ],
    questions: [
      {
        id: 'q-fullname',
        type: 'shortAnswer',
        label: 'Full Name (as to appear on certificate)',
        placeholder: 'e.g. Rahul Sharma',
        required: true,
        sectionId: section1Id,
        displayOrder: 1
      },
      {
        id: 'q-email',
        type: 'email',
        label: 'Official / College Email Address',
        placeholder: 'e.g. student@nbkrist.org',
        required: true,
        sectionId: section1Id,
        displayOrder: 2
      },
      {
        id: 'q-phone',
        type: 'phone',
        label: 'WhatsApp / Mobile Contact Number',
        placeholder: 'e.g. 9876543210',
        required: true,
        sectionId: section1Id,
        displayOrder: 3
      },
      {
        id: 'q-department',
        type: 'dropdown',
        label: 'Academic Branch / Department',
        required: true,
        options: [
          'Computer Science & Engineering (CSE)',
          'Artificial Intelligence & Data Science (AIDS)',
          'Electronics & Communication Engineering (ECE)',
          'Electrical & Electronics Engineering (EEE)',
          'Mechanical Engineering (MECH)',
          'Civil Engineering (CIVIL)',
          'Other / External Institution'
        ],
        sectionId: section1Id,
        displayOrder: 4
      },
      {
        id: 'q-year',
        type: 'dropdown',
        label: 'Current Year of Study',
        required: true,
        options: ['1st Year B.Tech', '2nd Year B.Tech', '3rd Year B.Tech', '4th Year B.Tech', 'Postgraduate / M.Tech', 'Faculty / Research Scholar'],
        sectionId: section1Id,
        displayOrder: 5
      },
      {
        id: 'q-agreement',
        type: 'agreement',
        label: 'I confirm that the details provided are accurate and I agree to adhere to NBKRIST code of conduct during the event.',
        required: true,
        sectionId: section1Id,
        displayOrder: 6
      }
    ],
    logicRules: [],
    paymentSettings: {
      enabled: false,
      amount: 0,
      currency: '₹',
      upiId: 'nbkrist@upi',
      instructions: 'Scan the official NBKRIST QR code using any UPI app (Google Pay, PhonePe, Paytm). Enter your Transaction UTR ID below.',
      transactionIdRequired: true,
      paymentScreenshotRequired: false,
      manualVerification: true
    },
    createdBy: hostUid
  };
}

/**
 * Fetch registration form definition for an event
 */
export async function getRegistrationForm(eventId: string): Promise<RegistrationFormDefinition | null> {
  try {
    const docRef = doc(db, EVENTS_COLLECTION, eventId, FORMS_SUBCOLLECTION, 'current');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as RegistrationFormDefinition;
  } catch (error) {
    console.warn("Notice: could not load custom form, using default if needed:", error);
    return null;
  }
}

/**
 * Save / Publish registration form definition with automated versioning
 */
export async function saveRegistrationForm(
  eventId: string,
  form: RegistrationFormDefinition,
  hostUid: string,
  publish: boolean = false
): Promise<RegistrationFormDefinition> {
  const currentRef = doc(db, EVENTS_COLLECTION, eventId, FORMS_SUBCOLLECTION, 'current');
  const existingSnap = await getDoc(currentRef);

  let nextVersion = form.version || 1;
  if (existingSnap.exists()) {
    const existingData = existingSnap.data() as RegistrationFormDefinition;
    // Bump version if previously published form is being edited
    if (existingData.status === 'published' && publish) {
      nextVersion = (existingData.version || 1) + 1;
    } else {
      nextVersion = existingData.version || 1;
    }
  }

  const payload: RegistrationFormDefinition = {
    ...form,
    formId: 'current',
    eventId,
    version: nextVersion,
    status: publish ? 'published' : (form.status || 'draft'),
    updatedAt: serverTimestamp(),
    createdAt: form.createdAt || serverTimestamp(),
    createdBy: hostUid
  };

  try {
    // 1. Save current active form
    await setDoc(currentRef, payload);

    // 2. Also preserve immutable version history under v{version}
    const versionRef = doc(db, EVENTS_COLLECTION, eventId, FORMS_SUBCOLLECTION, `v${nextVersion}`);
    await setDoc(versionRef, payload);

    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${EVENTS_COLLECTION}/${eventId}/registrationForms/current`);
  }
}

/**
 * Check if a participant has already registered for an event
 */
export async function checkUserRegistration(eventId: string, userId: string): Promise<EventRegistration | null> {
  try {
    // Check user's own index first
    const userRegRef = doc(db, 'users', userId, REGISTRATIONS_SUBCOLLECTION, `${eventId}_${userId}`);
    const userSnap = await getDoc(userRegRef);
    if (userSnap.exists()) {
      return userSnap.data() as EventRegistration;
    }

    // Fallback: check event's registration subcollection directly with specific doc ID
    const eventRegRef = doc(db, EVENTS_COLLECTION, eventId, REGISTRATIONS_SUBCOLLECTION, `${eventId}_${userId}`);
    const eventSnap = await getDoc(eventRegRef);
    if (eventSnap.exists()) {
      return eventSnap.data() as EventRegistration;
    }

    return null;
  } catch (e) {
    console.warn("Notice checking existing user registration:", e);
    return null;
  }
}

/**
 * Submit participant registration for an event
 */
export async function submitEventRegistration(
  eventId: string,
  event: NBKRISTEvent,
  userId: string,
  userEmail: string,
  participantName: string,
  formVersion: number,
  answers: Record<string, any>,
  paymentData?: {
    enabled: boolean;
    amount: number;
    currency: string;
    transactionId?: string;
    screenshotUrl?: string;
  }
): Promise<string> {
  // Deterministic ID enforces one registration per participant at the Firestore document level
  const registrationId = `${eventId}_${userId}`;
  const now = new Date().toISOString();

  const registrationPayload: EventRegistration = {
    registrationId,
    eventId,
    eventTitle: event.title,
    userId,
    userEmail,
    participantName,
    formVersion,
    answers,
    payment: paymentData?.enabled ? {
      enabled: true,
      amount: paymentData.amount || 0,
      currency: paymentData.currency || '₹',
      transactionId: paymentData.transactionId || '',
      screenshotUrl: paymentData.screenshotUrl || '',
      status: 'pending'
    } : {
      enabled: false,
      amount: 0,
      currency: '₹',
      status: 'verified' // Free events verified by default
    },
    status: 'confirmed',
    submittedAt: now,
    posterUrl: event.posterUrl || '',
    eventDate: event.date || '',
    eventVenue: event.venue || 'NBKRIST Campus'
  };

  try {
    // 1. Write authoritative document under event
    const eventRegRef = doc(db, EVENTS_COLLECTION, eventId, REGISTRATIONS_SUBCOLLECTION, registrationId);
    await setDoc(eventRegRef, {
      ...registrationPayload,
      serverSubmittedAt: serverTimestamp()
    });

    // 2. Write copy under user's profile for fast "My Registrations" view
    const userRegRef = doc(db, 'users', userId, REGISTRATIONS_SUBCOLLECTION, registrationId);
    await setDoc(userRegRef, {
      ...registrationPayload,
      serverSubmittedAt: serverTimestamp()
    });

    return registrationId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${EVENTS_COLLECTION}/${eventId}/registrations/${registrationId}`);
  }
}

/**
 * Get all registrations for an event (Host Dashboard)
 */
export async function getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
  try {
    const regCollectionRef = collection(db, EVENTS_COLLECTION, eventId, REGISTRATIONS_SUBCOLLECTION);
    const snap = await getDocs(regCollectionRef);
    const list: EventRegistration[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as EventRegistration);
    });
    // Sort newest first
    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `${EVENTS_COLLECTION}/${eventId}/registrations`);
    return [];
  }
}

/**
 * Realtime subscription to registrations for an event (Host Dashboard)
 */
export function subscribeToEventRegistrations(
  eventId: string,
  callback: (regs: EventRegistration[]) => void,
  errorCallback?: (err: any) => void
) {
  const regCollectionRef = collection(db, EVENTS_COLLECTION, eventId, REGISTRATIONS_SUBCOLLECTION);

  return onSnapshot(
    regCollectionRef,
    (snapshot) => {
      const list: EventRegistration[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as EventRegistration);
      });
      list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      callback(list);
    },
    (err) => {
      console.warn("Notice: event registrations subscription:", err);
      if (errorCallback) errorCallback(err);
    }
  );
}

/**
 * Update payment verification status (Host Dashboard action)
 */
export async function updateRegistrationPaymentStatus(
  eventId: string,
  registrationId: string,
  userId: string,
  status: 'pending' | 'verified' | 'rejected',
  notes?: string,
  verifiedByUid?: string
): Promise<void> {
  const now = new Date().toISOString();
  const updateData = {
    'payment.status': status,
    'payment.verifiedAt': now,
    'payment.verifiedBy': verifiedByUid || 'host',
    ...(notes !== undefined ? { 'payment.notes': notes } : {})
  };

  try {
    // Update on event subcollection
    const eventRegRef = doc(db, EVENTS_COLLECTION, eventId, REGISTRATIONS_SUBCOLLECTION, registrationId);
    await updateDoc(eventRegRef, updateData);

    // Also update on user copy
    if (userId) {
      const userRegRef = doc(db, 'users', userId, REGISTRATIONS_SUBCOLLECTION, registrationId);
      await updateDoc(userRegRef, updateData).catch(() => {});
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${EVENTS_COLLECTION}/${eventId}/registrations/${registrationId}`);
  }
}

/**
 * Get all registrations for the current participant (My Registrations)
 */
export async function getUserRegistrations(userId: string): Promise<EventRegistration[]> {
  try {
    const userRegsRef = collection(db, 'users', userId, REGISTRATIONS_SUBCOLLECTION);
    const snap = await getDocs(userRegsRef);
    const list: EventRegistration[] = [];
    snap.forEach((d) => {
      list.push(d.data() as EventRegistration);
    });
    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return list;
  } catch (error) {
    console.warn("Notice fetching user registrations:", error);
    return [];
  }
}

