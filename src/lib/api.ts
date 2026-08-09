import { AppNotification, CarouselSlide, GeoCategory, GeoLocation, NetworkLink, ServiceTemplate, SiteMetric, Submission, SubmissionStatus } from '../types';

const json = { 'Content-Type': 'application/json' };
const token = () => sessionStorage.getItem('sh_admin_token');
const call = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const headers = { ...json, ...(init?.headers || {}) } as Record<string, string>;
  if (token()) headers['Authorization'] = `Bearer ${token()}`;
  const res = await fetch(`/api${url}`, { ...init, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const api = {
  getLocations: () => call<GeoLocation[]>('/locations'),
  addLocation: (loc: GeoLocation) => call<GeoLocation>('/locations', { method: 'POST', headers: json, body: JSON.stringify(loc) }),
  updateLocation: (loc: GeoLocation) => call<GeoLocation>(`/locations/${loc.id}`, { method: 'PUT', headers: json, body: JSON.stringify(loc) }),
  deleteLocation: (id: string) => call<{ ok: true }>(`/locations/${id}`, { method: 'DELETE' }),
  getCategories: () => call<GeoCategory[]>('/categories'),
  addCategory: (cat: GeoCategory) => call<GeoCategory>('/categories', { method: 'POST', headers: json, body: JSON.stringify(cat) }),
  updateCategory: (cat: GeoCategory) => call<GeoCategory>(`/categories/${cat.id}`, { method: 'PUT', headers: json, body: JSON.stringify(cat) }),
  deleteCategory: (id: string) => call<{ ok: true }>(`/categories/${id}`, { method: 'DELETE' }),
  bootstrap: () => call<{ services: ServiceTemplate[]; submissions: Submission[]; notifications: AppNotification[]; activityLogs: any[]; locations: GeoLocation[]; categories: GeoCategory[]; networkLinks: NetworkLink[]; carouselSlides: CarouselSlide[]; siteMetrics: SiteMetric[]; assistantQuestions: string[] }>('/bootstrap'),
  getSubmissions: () => call<Submission[]>('/submissions'),
  login: (email: string, password: string) => call<{ token: string; name: string }>('/login', { method: 'POST', headers: json, body: JSON.stringify({ email, password }) }),
  logActivity: (action: string, iconType?: string) => call<{ id: string; action: string; timestamp: string; iconType: string }>('/activity-logs', { method: 'POST', headers: json, body: JSON.stringify({ action, iconType }) }),
  askAssistant: (message: string) => call<{ text: string }>('/assistant', { method: 'POST', headers: json, body: JSON.stringify({ message }) }),
  addService: (service: ServiceTemplate) => call<ServiceTemplate>('/services', { method: 'POST', headers: json, body: JSON.stringify(service) }),
  updateService: (service: ServiceTemplate) => call<ServiceTemplate>(`/services/${service.id}`, { method: 'PUT', headers: json, body: JSON.stringify(service) }),
  deleteService: (id: string) => call<{ ok: true }>(`/services/${id}`, { method: 'DELETE' }),
  addSubmission: (submission: Submission) => call<Submission>('/submissions', { method: 'POST', headers: json, body: JSON.stringify(submission) }),
  updateStatus: (id: string, status: SubmissionStatus, adminNote?: string) => call<{ submission: Submission; notification: AppNotification }>(`/submissions/${id}/status`, { method: 'PUT', headers: json, body: JSON.stringify({ status, adminNote }) }),
  deleteSubmission: (id: string) => call<{ ok: true }>(`/submissions/${id}`, { method: 'DELETE' }),
  setNotificationRead: (id: string) => call<AppNotification>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => call<AppNotification[]>('/notifications/read-all', { method: 'PUT' }),
  clearNotifications: () => call<{ ok: true }>('/notifications', { method: 'DELETE' }),
  getNetworkLinks: () => call<NetworkLink[]>('/network-links'),
  getAllNetworkLinks: () => call<NetworkLink[]>('/network-links/all'),
  addNetworkLink: (link: NetworkLink) => call<NetworkLink>('/network-links', { method: 'POST', headers: json, body: JSON.stringify(link) }),
  updateNetworkLink: (link: NetworkLink) => call<NetworkLink>(`/network-links/${link.id}`, { method: 'PUT', headers: json, body: JSON.stringify(link) }),
  deleteNetworkLink: (id: string) => call<{ ok: true }>(`/network-links/${id}`, { method: 'DELETE' }),
};
