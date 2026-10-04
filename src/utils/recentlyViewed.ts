import { NBKRISTEvent } from '../types';

const RECENTLY_VIEWED_KEY = 'nbkrist_recently_viewed_events';

export interface ViewedEventItem {
  event: NBKRISTEvent;
  viewedAt: string;
}

export function getRecentlyViewedEvents(): ViewedEventItem[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ViewedEventItem[];
  } catch {
    return [];
  }
}

export function addRecentlyViewedEvent(event: NBKRISTEvent): void {
  if (!event || !event.eventId) return;
  try {
    const current = getRecentlyViewedEvents();
    // Filter out existing instance of this event
    const filtered = current.filter(item => item.event.eventId !== event.eventId);
    
    // Add to top of list
    const updated: ViewedEventItem[] = [
      { event, viewedAt: new Date().toISOString() },
      ...filtered
    ].slice(0, 20); // Keep last 20 viewed events

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Unable to save recently viewed event to localStorage:", e);
  }
}

export function clearRecentlyViewedEvents(): void {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch {
    // Ignore error
  }
}
