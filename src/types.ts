import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'student' | 'admin';
  createdAt: Timestamp;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  loginWindow?: number; // in minutes (restriction time)
  startTime?: Timestamp;
  endTime?: Timestamp;
  questions: Question[];
  status: 'draft' | 'active' | 'completed';
  pattern: string;
  password?: string;
  allowedEmails?: string[];
  createdBy: string;
}

export interface Submission {
  id: string;
  examId: string;
  userId: string;
  userName?: string;
  answers: Record<string, number>;
  score?: number;
  status: 'in-progress' | 'submitted' | 'failed' | 'retake_allowed';
  startedAt: Timestamp;
  submittedAt?: Timestamp;
  tabSwitches: number;
  reason?: string;
  specialLoginExpiry?: Timestamp;
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  url: string;
  category?: string;
  thumbnail?: string;
}

export interface AdminMaterial {
  id: string;
  topic: string;
  chapter: string;
  details: string;
  content: string;
  videoUrl?: string;
  allowedEmails: string[]; // If empty, visible to everyone
  createdBy: string;
  createdAt: Timestamp;
}
