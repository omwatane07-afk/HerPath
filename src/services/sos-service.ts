import { Coordinates, SOSEvent } from '../types';
import { generateId } from '../lib/utils';

const SOS_AUDIT_KEY = 'herpath_sos_audit_events';
const SOS_TEST_MODE_KEY = 'herpath_sos_test_mode';

/**
 * SOS Triple-Tap Detection and Emergency Lifecycle Service
 */
export class SOSService {
  private static tapTimestamps: number[] = [];
  private static inMemoryEvents: SOSEvent[] = [];
  public static readonly TAP_WINDOW_MS = 2000; // 2-second triple tap window

  /**
   * Evaluates a tap on the SOS trigger button.
   * Returns current tap count within the rolling 2-second window
   * and whether the triple-tap condition was achieved.
   */
  static registerTap(now: number = Date.now()): {
    tapCount: number;
    isTriggered: boolean;
    remainingTaps: number;
  } {
    // Purge taps older than window
    const windowStart = now - this.TAP_WINDOW_MS;
    this.tapTimestamps = this.tapTimestamps.filter((t) => t >= windowStart);

    // Register new tap
    this.tapTimestamps.push(now);
    const count = this.tapTimestamps.length;

    if (count >= 3) {
      // Triple tap reached! Reset counter and trigger
      this.tapTimestamps = [];
      return {
        tapCount: 3,
        isTriggered: true,
        remainingTaps: 0,
      };
    }

    return {
      tapCount: count,
      isTriggered: false,
      remainingTaps: 3 - count,
    };
  }

  /**
   * Resets the tap counter (e.g. when interval expires or user leaves)
   */
  static resetTaps(): void {
    this.tapTimestamps = [];
  }

  /**
   * Test Mode toggle for hackathon demonstrations
   */
  static isTestMode(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(SOS_TEST_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  static setTestMode(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SOS_TEST_MODE_KEY, String(enabled));
    } catch {}
  }

  /**
   * Logs an emergency event locally for audit and recovery without server leak
   */
  static createEvent(
    location?: Coordinates,
    accuracyMeters?: number,
    triggerMethod: 'triple_tap' | 'quick_action' = 'triple_tap',
    isTestMode: boolean = false
  ): SOSEvent {
    const event: SOSEvent = {
      id: generateId('sos'),
      activatedAt: new Date().toISOString(),
      location,
      locationAccuracyMeters: accuracyMeters,
      isTestMode,
      triggerMethod,
      status: 'countdown',
    };

    this.saveEvent(event);
    return event;
  }

  static updateEventStatus(
    eventId: string,
    status: 'active' | 'cancelled' | 'resolved'
  ): void {
    const events = this.getEvents();
    const now = new Date().toISOString();
    const updated = events.map((ev) => {
      if (ev.id !== eventId) return ev;
      return {
        ...ev,
        status,
        ...(status === 'cancelled' ? { cancelledAt: now } : {}),
        ...(status === 'resolved' ? { resolvedAt: now } : {}),
      };
    });
    this.saveEvents(updated);
  }

  static getEvents(): SOSEvent[] {
    if (typeof window === 'undefined') return this.inMemoryEvents;
    try {
      const raw = localStorage.getItem(SOS_AUDIT_KEY);
      return raw ? JSON.parse(raw) : this.inMemoryEvents;
    } catch {
      return this.inMemoryEvents;
    }
  }

  private static saveEvent(event: SOSEvent): void {
    const events = this.getEvents();
    this.saveEvents([event, ...events.slice(0, 19)]); // Keep last 20 events
  }

  private static saveEvents(events: SOSEvent[]): void {
    this.inMemoryEvents = events;
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SOS_AUDIT_KEY, JSON.stringify(events));
    } catch {}
  }
}
