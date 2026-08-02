import { create } from 'zustand';
import { AccessibilitySettings, AppNotification, CarouselSlide, GeoCategory, GeoLocation, NetworkLink, ServiceTemplate, SiteMetric, Submission, SubmissionStatus } from '../types';
import { api } from '../lib/api';

export type ActivityLog = { id: string; action: string; timestamp: string; iconType: string };

interface AppState {
  services: ServiceTemplate[];
  submissions: Submission[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  locations: GeoLocation[];
  categories: GeoCategory[];
  networkLinks: NetworkLink[];
  carouselSlides: CarouselSlide[];
  siteMetrics: SiteMetric[];
  assistantQuestions: string[];
  accessibility: AccessibilitySettings;
  isInitialized: boolean;

  initStore: () => Promise<void>;

  addService: (service: ServiceTemplate) => Promise<void>;
  updateService: (service: ServiceTemplate) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  addLocation: (loc: GeoLocation) => Promise<void>;
  updateLocation: (loc: GeoLocation) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;

  addCategory: (cat: GeoCategory) => Promise<void>;
  updateCategory: (cat: GeoCategory) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addSubmission: (sub: Submission) => Promise<void>;
  updateSubmissionStatus: (id: string, status: SubmissionStatus, note?: string) => Promise<any>;
  deleteSubmission: (id: string) => Promise<void>;

  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  addLocalNotification: (notif: AppNotification) => void;

  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  refreshActivityLogs: () => Promise<void>;

  addNetworkLink: (link: NetworkLink) => Promise<void>;
  updateNetworkLink: (link: NetworkLink) => Promise<void>;
  deleteNetworkLink: (id: string) => Promise<void>;
}

async function commit(set: (fn: (s: AppState) => Partial<AppState>) => void, apply: (s: AppState) => Partial<AppState>, apiCall: () => Promise<unknown>, rollback: (s: AppState) => Partial<AppState>): Promise<void> {
  set(apply);
  try {
    await apiCall();
  } catch (e) {
    set(rollback);
    throw e;
  }
}

export const useStore = create<AppState>((set, get) => ({
  services: [],
  submissions: [],
  locations: [],
  categories: [],
  notifications: [],
  activityLogs: [],
  networkLinks: [] as NetworkLink[],
  carouselSlides: [] as CarouselSlide[],
  siteMetrics: [] as SiteMetric[],
  assistantQuestions: [] as string[],
  accessibility: {
    textSize: 'normal',
    contrast: 'normal',
    dyslexiaFont: false,
    textToSpeech: false,
    screenReaderActive: false
  },
  isInitialized: false,

  initStore: async () => {
    try {
      const data = await api.bootstrap();
      set({
        services: data.services,
        submissions: data.submissions,
        locations: data.locations,
        categories: data.categories,
        networkLinks: data.networkLinks || [],
        notifications: data.notifications,
        activityLogs: data.activityLogs || [],
        carouselSlides: data.carouselSlides,
        siteMetrics: data.siteMetrics,
        assistantQuestions: data.assistantQuestions,
        isInitialized: true
      });
    } catch (err) {
      console.warn('API Bootstrap gagal:', err);

      set({
        services: [],
        submissions: [],
        locations: [],
        categories: [],
        notifications: [],
        activityLogs: [],
        networkLinks: [],
        carouselSlides: [],
        siteMetrics: [],
        assistantQuestions: [],
        isInitialized: true
      });
      throw err; // So UI can toast
    }
  },

  addService: async (service) => {
    await commit(set,
      s => ({ services: [service, ...s.services] }),
      () => api.addService(service),
      s => ({ services: s.services.filter(x => x.id !== service.id) }),
    );
  },

  updateService: async (service) => {
    const prev = get().services;
    await commit(set,
      s => ({ services: s.services.map(x => x.id === service.id ? service : x) }),
      () => api.updateService(service),
      () => ({ services: prev }),
    );
  },

  deleteService: async (id) => {
    const prev = get().services;
    await commit(set,
      s => ({ services: s.services.filter(x => x.id !== id) }),
      () => api.deleteService(id),
      () => ({ services: prev }),
    );
  },

  addSubmission: async (sub) => {
    await commit(set,
      s => ({ submissions: [sub, ...s.submissions] }),
      () => api.addSubmission(sub),
      s => ({ submissions: s.submissions.filter(x => x.id !== sub.id) }),
    );
  },

  updateSubmissionStatus: async (id, status, note) => {
    try {
      const { submission, notification } = await api.updateStatus(id, status, note);
      set(s => ({
        submissions: s.submissions.map(x => x.id === id ? submission : x),
        notifications: s.notifications.some(n => n.id === notification.id)
          ? s.notifications
          : [notification, ...s.notifications]
      }));
      return { submission, notification };
    } catch (e) {
      throw e;
    }
  },

  deleteSubmission: async (id) => {
    const prev = get().submissions;
    await commit(set,
      s => ({ submissions: s.submissions.filter(x => x.id !== id) }),
      () => api.deleteSubmission(id),
      () => ({ submissions: prev }),
    );
  },

  addLocation: async (loc) => {
    await commit(set,
      s => ({ locations: [loc, ...s.locations] }),
      () => api.addLocation(loc),
      s => ({ locations: s.locations.filter(x => x.id !== loc.id) }),
    );
  },

  updateLocation: async (loc) => {
    const prev = get().locations;
    await commit(set,
      s => ({ locations: s.locations.map(x => x.id === loc.id ? loc : x) }),
      () => api.updateLocation(loc),
      () => ({ locations: prev }),
    );
  },

  deleteLocation: async (id) => {
    const prev = get().locations;
    await commit(set,
      s => ({ locations: s.locations.filter(x => x.id !== id) }),
      () => api.deleteLocation(id),
      () => ({ locations: prev }),
    );
  },

  addCategory: async (cat) => {
    await commit(set,
      s => ({ categories: [...s.categories, cat] }),
      () => api.addCategory(cat),
      s => ({ categories: s.categories.filter(x => x.id !== cat.id) }),
    );
  },

  updateCategory: async (cat) => {
    const prev = get().categories;
    await commit(set,
      s => ({ categories: s.categories.map(x => x.id === cat.id ? cat : x) }),
      () => api.updateCategory(cat),
      () => ({ categories: prev }),
    );
  },

  deleteCategory: async (id) => {
    const prev = get().categories;
    await commit(set,
      s => ({ categories: s.categories.filter(x => x.id !== id) }),
      () => api.deleteCategory(id),
      () => ({ categories: prev }),
    );
  },

  markNotificationRead: async (id) => {
    set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n) }));
    try { await api.setNotificationRead(id); } catch (e) {}
  },

  markAllNotificationsRead: async () => {
    set(s => ({ notifications: s.notifications.map(n => ({ ...n, isRead: true })) }));
    try { await api.markAllRead(); } catch (e) {}
  },

  clearNotifications: async () => {
    set({ notifications: [] });
    try { await api.clearNotifications(); } catch (e) {}
  },
  
  addLocalNotification: (notif) => {
    set(s => ({ notifications: [notif, ...s.notifications] }));
  },

  updateAccessibility: (settings) => {
    set(s => {
      const newAcc = { ...s.accessibility, ...settings };
      localStorage.setItem('sh_accessibility_v1', JSON.stringify(newAcc));
      return { accessibility: newAcc };
    });
  },

  refreshActivityLogs: async () => {
    try {
      const log = await api.logActivity('Admin menyegarkan catatan audit log', 'info');
      set(s => ({ activityLogs: [log, ...s.activityLogs] }));
    } catch {
      // biarkan state tetap
    }
  },

  addNetworkLink: async (link) => {
    await commit(set,
      s => ({ networkLinks: [link, ...s.networkLinks] }),
      () => api.addNetworkLink(link),
      s => ({ networkLinks: s.networkLinks.filter(x => x.id !== link.id) }),
    );
  },

  updateNetworkLink: async (link) => {
    const prev = get().networkLinks;
    await commit(set,
      s => ({ networkLinks: s.networkLinks.map(x => x.id === link.id ? link : x) }),
      () => api.updateNetworkLink(link),
      () => ({ networkLinks: prev }),
    );
  },

  deleteNetworkLink: async (id) => {
    const prev = get().networkLinks;
    await commit(set,
      s => ({ networkLinks: s.networkLinks.filter(x => x.id !== id) }),
      () => api.deleteNetworkLink(id),
      () => ({ networkLinks: prev }),
    );
  },
}));
