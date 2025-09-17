import { Coach } from './coach';
import { Student } from './student';

export interface Court {
  id: number;
  name: string;
  location?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourtFormData {
  name: string;
  location?: string;
}

export interface Class {
  id: number;
  name: string;
  coachId: number;
  coach?: Coach;
  courtId: number;
  court?: Court;
  dayOfWeek: number;
  startTime: Date;
  endTime: Date;
  isRecurring: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  students?: ClassEnrollment[];
}

export interface ClassFormData {
  name: string;
  coachId: number;
  courtId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

export interface ClassEnrollment {
  id: number;
  studentId: number;
  student?: Student;
  classId: number;
  class?: Class;
  joinedAt?: Date;
}