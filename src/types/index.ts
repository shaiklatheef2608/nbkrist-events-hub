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

export type RegistrationQuestionType = 
  | 'shortAnswer'
  | 'longAnswer'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'time'
  | 'dateTime'
  | 'dropdown'
  | 'multipleChoice'
  | 'checkboxes'
  | 'yesNo'
  | 'rating'
  | 'agreement'
  | 'section'
  | 'image'
  | 'payment'
  | 'transactionId'
  | 'paymentScreenshot';

export interface LogicCondition {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isAnswered' | 'isNotAnswered';
  value?: any;
}

export interface LogicRule {
  id: string;
  combinator: 'AND' | 'OR';
  conditions: LogicCondition[];
  action: 'showQuestion' | 'hideQuestion' | 'goToSection' | 'skipSection' | 'endRegistration';
  targetId: string;
}

export interface FormQuestion {
  id: string;
  type: RegistrationQuestionType;
  label: string;
  description?: string;
  helpText?: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  sectionId: string;
  displayOrder: number;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customError?: string;
  };
  imageUrl?: string;
  altText?: string;
  caption?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  displayOrder: number;
}

export interface PaymentSettings {
  enabled: boolean;
  amount: number;
  currency: string;
  upiId: string;
  qrImageUrl?: string;
  instructions?: string;
  transactionIdRequired: boolean;
  paymentScreenshotRequired: boolean;
  manualVerification: boolean;
}

export interface RegistrationFormDefinition {
  formId: string;
  eventId: string;
  title: string;
  description?: string;
  version: number;
  sections: FormSection[];
  questions: FormQuestion[];
  logicRules: LogicRule[];
  paymentSettings: PaymentSettings;
  allowDuplicateRegistration?: boolean; // false = "One registration per participant"
  capacityLimit?: number;
  registrationDeadline?: string;
  status: 'draft' | 'published';
  createdAt?: any;
  updatedAt?: any;
  createdBy: string;
}

export interface EventRegistration {
  registrationId: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userEmail: string;
  participantName?: string;
  formVersion: number;
  answers: Record<string, any>;
  payment?: {
    enabled: boolean;
    amount: number;
    currency: string;
    transactionId?: string;
    screenshotUrl?: string;
    status: 'pending' | 'verified' | 'rejected';
    verifiedAt?: any;
    verifiedBy?: string;
    notes?: string;
  };
  status: 'confirmed' | 'pending' | 'cancelled';
  submittedAt: any;
  posterUrl?: string;
  eventDate?: string;
  eventVenue?: string;
}
