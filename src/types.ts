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
  answers: Record<string, number>;
  score?: number;
  status: 'in-progress' | 'submitted' | 'failed';
  startedAt: Timestamp;
  submittedAt?: Timestamp;
  tabSwitches: number;
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  url: string;
  category?: string;
  thumbnail?: string;
}
