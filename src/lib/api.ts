import { AppNotification, CarouselSlide, GeoCategory, GeoLocation, NetworkLink, ReplyTemplate, ServiceTemplate, SiteMetric, Submission, SubmissionStatus } from '../types';

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
  bootstrap: () => call<{ services: ServiceTemplate[]; submissions: Submission[]; notifications: AppNotification[]; activityLogs: any[]; locations: GeoLocation[]; categories: GeoCategory[]; networkLinks: NetworkLink[]; carouselSlides: CarouselSlide[]; siteMetrics: SiteMetric[]; replyTemplates: ReplyTemplate[]; assistantQuestions: string[] }>('/bootstrap'),
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
  addReplyTemplate: (t: ReplyTemplate) => call<ReplyTemplate>('/reply-templates', { method: 'POST', headers: json, body: JSON.stringify(t) }),
  updateReplyTemplate: (t: ReplyTemplate) => call<ReplyTemplate>(`/reply-templates/${t.id}`, { method: 'PUT', headers: json, body: JSON.stringify(t) }),
  deleteReplyTemplate: (id: string) => call<{ ok: true }>(`/reply-templates/${id}`, { method: 'DELETE' }),
  updateSiteMetric: (key: string, value: string, label: string) => call<SiteMetric>(`/site-metrics/${key}`, { method: 'PUT', headers: json, body: JSON.stringify({ value, label }) }),
  updateCarouselSlide: (slide: CarouselSlide) => call<CarouselSlide>(`/carousel-slides/${slide.id}`, { method: 'PUT', headers: json, body: JSON.stringify(slide) }),
  addCarouselSlide: (slide: CarouselSlide) => call<CarouselSlide>('/carousel-slides', { method: 'POST', headers: json, body: JSON.stringify(slide) }),
  deleteCarouselSlide: (id: string) => call<{ ok: true }>(`/carousel-slides/${id}`, { method: 'DELETE' }),
};

// Unduh rekap permohonan (CSV/XLSX) — ikut filter aktif.
export const downloadSubmissionsExport = async (
  format: 'csv' | 'xlsx',
  filters: { serviceId?: string; status?: string; dateStart?: string; dateEnd?: string },
): Promise<void> => {
  const params = new URLSearchParams();
  if (filters.serviceId) params.set('serviceId', filters.serviceId);
  if (filters.status) params.set('status', filters.status);
  if (filters.dateStart) params.set('dateStart', filters.dateStart);
  if (filters.dateEnd) params.set('dateEnd', filters.dateEnd);
  const qs = params.toString();
  const res = await fetch(`/api/export/submissions/${format}${qs ? '?' + qs : ''}`, {
    headers: token() ? { Authorization: `Bearer ${token()}` } : {},
  });
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition') || '';
  const m = cd.match(/filename="([^"]+)"/);
  const filename = m ? m[1] : `rekap-permohonan.${format}`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Unduh ekspor lokasi (admin) — fetch blob + trigger download browser.
export const downloadExport = async (format: string, ids?: string[]): Promise<void> => {
  const params = ids && ids.length ? `?ids=${ids.join(',')}` : '';
  const res = await fetch(`/api/export/locations/${format}${params}`, {
    headers: token() ? { Authorization: `Bearer ${token()}` } : {},
  });
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition') || '';
  const m = cd.match(/filename="([^"]+)"/);
  const filename = m ? m[1] : `lokasi.${format === 'shp' ? 'zip' : format}`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
