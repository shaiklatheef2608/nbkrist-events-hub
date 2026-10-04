export type RegistrationMethod = 'externalWebsite' | 'googleForm' | 'microsoftForm' | 'email';

export type EventStatus = 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'completed';

export interface NBKRISTEvent {
  eventId: string;
  title: string;
  posterUrl?: string;
  description: string;
  organization: string; // e.g. "CSE NBKRIST", "IEEE NBKRIST"
  department: string;   // e.g. "Computer Science & Engineering", "Interdisciplinary"
  eventType: string;    // e.g. "Symposium", "Workshop", "Hackathon", "Guest Lecture"
  date: string;         // YYYY-MM-DD
  endDate?: string;      // YYYY-MM-DD
  featured?: boolean;   // featured event flag
  startTime: string;    // e.g. "09:30 AM"
  endTime?: string;     // e.g. "04:30 PM"
  venue: string;        // e.g. "Auditorium Block A, NBKRIST"
  registrationFee: string; // e.g. "Free" or "₹250 / Delegate"
  registrationDeadline?: string;
  registrationMethod: RegistrationMethod;
  registrationUrl?: string;
  registrationEmail?: string;
  coordinatorName?: string;
  coordinatorEmail?: string;
  coordinatorPhone?: string;
  status: EventStatus;
  createdBy: string;    // UID of host
  organizationId: string; // Normalized key e.g. "cse-nbkrist"
  createdAt?: any;
  updatedAt?: any;
}

export interface ApprovedHost {
  email: string;
  organization: string;
  approved: boolean;
  hostType?: string;
}

export interface HostProfile {
  uid: string;
  email: string;
  organization: string;
  hostType: string;
  approved?: boolean;
  createdAt?: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  createdAt?: any;
}

export interface FilterState {
  searchQuery: string;
  department: string;
  organization: string;
  eventType: string;
  pricing: string; // 'all' | 'free' | 'paid'
  status: string;  // 'all' | 'registration_open' | 'published' | 'registration_closed' | 'completed'
  dateFilter: string; // 'all' | 'today' | 'upcoming' | 'past'
}
