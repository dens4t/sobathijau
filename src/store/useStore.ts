import { create } from 'zustand';
import { GeoCategory, GeoLocation, NetworkLink, ServiceTemplate, Submission, AppNotification, AccessibilitySettings, SubmissionStatus } from '../types';
import { api } from '../lib/api';
import { defaultServices, defaultSubmissions } from '../data/defaultServices';
import { defaultLocations } from '../data/defaultLocations';
import { defaultCategories } from '../data/defaultCategories';

export type ActivityLog = { id: string; action: string; timestamp: string; iconType: string };

interface AppState {
  services: ServiceTemplate[];
  submissions: Submission[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  locations: GeoLocation[];
  categories: GeoCategory[];
  networkLinks: NetworkLink[];
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
  refreshActivityLogs: () => void;

  addNetworkLink: (link: NetworkLink) => Promise<void>;
  updateNetworkLink: (link: NetworkLink) => Promise<void>;
  deleteNetworkLink: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  services: defaultServices,
  submissions: defaultSubmissions,
  locations: defaultLocations,
  categories: defaultCategories,
  notifications: [],
  activityLogs: [
    { id: 'log-1', action: 'Login berhasil sebagai Administrator DLH Pontianak', timestamp: '2026-06-03 12:44', iconType: 'success' },
    { id: 'log-2', action: 'Memverifikasi kelayakan teknis berkas PT. Pontianak Tirta Agung', timestamp: '2026-06-03 11:20', iconType: 'info' },
    { id: 'log-3', action: 'Menerbitkan rekomendasi kelayakan UKL-UPL Bapak Ahmad Subardjo', timestamp: '2026-06-03 09:12', iconType: 'success' },
    { id: 'log-4', action: 'Memperbarui koordinat sebaran TPS 3R di peta lingkungan', timestamp: '2026-06-02 16:30', iconType: 'info' },
    { id: 'log-5', action: 'Menambahkan kuesioner baru untuk layanan Pengujian Kebisingan', timestamp: '2026-06-02 14:15', iconType: 'success' },
  ],
  networkLinks: [] as NetworkLink[],
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
        services: data.services.length ? data.services : defaultServices,
        submissions: data.submissions.length ? data.submissions : defaultSubmissions,
        locations: data.locations.length ? data.locations : defaultLocations,
        categories: data.categories.length ? data.categories : defaultCategories,
        networkLinks: data.networkLinks || [],
        notifications: data.notifications,
        activityLogs: data.activityLogs.length ? data.activityLogs : get().activityLogs,
        isInitialized: true
      });
    } catch (err) {
      console.warn('API Bootstrap failed, using local/default data');
      
      // Fallback to localStorage if API fails
      const lServices = localStorage.getItem('sh_services_v1');
      const lSubs = localStorage.getItem('sh_submissions_v1');
      const lNotifs = localStorage.getItem('sh_notifications_v1');
      
      set({
        services: lServices ? JSON.parse(lServices) : defaultServices,
        submissions: lSubs ? JSON.parse(lSubs) : defaultSubmissions,
        notifications: lNotifs ? JSON.parse(lNotifs) : [],
        isInitialized: true
      });
      throw err; // So UI can toast
    }
  },

  addService: async (service) => {
    set(s => ({ services: [service, ...s.services] }));
    try { await api.addService(service); } catch (e) { throw e; }
  },

  updateService: async (service) => {
    set(s => ({ services: s.services.map(x => x.id === service.id ? service : x) }));
    try { await api.updateService(service); } catch (e) { throw e; }
  },

  deleteService: async (id) => {
    set(s => ({ services: s.services.filter(x => x.id !== id) }));
    try { await api.deleteService(id); } catch (e) { throw e; }
  },

  addSubmission: async (sub) => {
    set(s => ({ submissions: [sub, ...s.submissions] }));
    try { await api.addSubmission(sub); } catch (e) { throw e; }
  },

  updateSubmissionStatus: async (id, status, note) => {
    // API will return updated submission and new notification. 
    // State will be updated by caller for immediate feedback or we can do it after.
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
    set(s => ({ submissions: s.submissions.filter(x => x.id !== id) }));
    try { await api.deleteSubmission(id); } catch (e) { throw e; }
  },

  addLocation: async (loc) => {
    set(s => ({ locations: [loc, ...s.locations] }));
    try { await api.addLocation(loc); } catch (e) { throw e; }
  },

  updateLocation: async (loc) => {
    set(s => ({ locations: s.locations.map(x => x.id === loc.id ? loc : x) }));
    try { await api.updateLocation(loc); } catch (e) { throw e; }
  },

  deleteLocation: async (id) => {
    set(s => ({ locations: s.locations.filter(x => x.id !== id) }));
    try { await api.deleteLocation(id); } catch (e) { throw e; }
  },

  addCategory: async (cat) => {
    set(s => ({ categories: [...s.categories, cat] }));
    try { await api.addCategory(cat); } catch (e) { throw e; }
  },

  updateCategory: async (cat) => {
    set(s => ({ categories: s.categories.map(x => x.id === cat.id ? cat : x) }));
    try { await api.updateCategory(cat); } catch (e) { throw e; }
  },

  deleteCategory: async (id) => {
    set(s => ({ categories: s.categories.filter(x => x.id !== id) }));
    try { await api.deleteCategory(id); } catch (e) { throw e; }
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

  refreshActivityLogs: () => {
    set(s => ({
      activityLogs: [
        { id: `log-${Date.now()}`, action: 'Admin menyegarkan catatan audit log lokal (refresh log)', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16), iconType: 'info' },
        ...s.activityLogs
      ]
    }));
  },

  addNetworkLink: async (link) => {
    set(s => ({ networkLinks: [link, ...s.networkLinks] }));
    try { await api.addNetworkLink(link); } catch (e) { throw e; }
  },

  updateNetworkLink: async (link) => {
    set(s => ({ networkLinks: s.networkLinks.map(x => x.id === link.id ? link : x) }));
    try { await api.updateNetworkLink(link); } catch (e) { throw e; }
  },

  deleteNetworkLink: async (id) => {
    set(s => ({ networkLinks: s.networkLinks.filter(x => x.id !== id) }));
    try { await api.deleteNetworkLink(id); } catch (e) { throw e; }
  },
}));
