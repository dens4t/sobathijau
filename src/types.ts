/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox_group';

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // Used for select and checkbox_group
}

export interface ServiceTemplate {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  category: 'Izin & Rekomendasi' | 'Laboratorium' | 'Kemitraan & Edukasi' | 'Layanan Umum';
  fields: FieldDefinition[];
  isCustom?: boolean;
}

export type SubmissionStatus = 'DIAJUKAN' | 'VERIFIKASI_ADMIN' | 'SURVEY_TEKNIS' | 'PROSES_REKOMENDASI' | 'SELESAI' | 'DITOLAK';

export interface StatusTimelineStep {
  status: SubmissionStatus;
  title: string;
  description: string;
  updatedAt: string;
  isCompleted: boolean;
  notes?: string;
}

export interface Submission {
  id: string; // Tracking code like SH-2026-XXXXX
  serviceId: string;
  serviceName: string;
  submittedAt: string;
  status: SubmissionStatus;
  applicantName: string;
  formData: Record<string, any>;
  timeline: StatusTimelineStep[];
}

export interface AccessibilitySettings {
  textSize: 'normal' | 'large' | 'extra-large';
  contrast: 'normal' | 'high' | 'grayscale';
  dyslexiaFont: boolean;
  textToSpeech: boolean;
  screenReaderActive: boolean;
}

export interface GeoCategory {
  id: string;
  name: string;
  description: string;      // Rich HTML description
  shortDesc: string;
  iconName: string;
  color: string;
  markerColor: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface GeoLocation {
  id: string;
  name: string;
  category: string; // references GeoCategory.name
  lat: number;
  lng: number;
  address: string;
  description: string;
  iconName: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  submissionId: string;
  applicantName: string;
  serviceName: string;
  newStatus: SubmissionStatus;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface NetworkLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

