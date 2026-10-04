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
import { NBKRISTEvent, EventStatus } from '../types';
import { APPROVED_HOSTS, HOST_METADATA } from '../utils/constants';

const EVENTS_COLLECTION = 'events';
const APPROVED_HOSTS_COLLECTION = 'approvedHosts';

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
