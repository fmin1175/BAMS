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

export interface Location {
  id: number;
  name: string;
  address: string;
  courts: number;
  facilities?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Class {
  id: number;
  name: string;
  coachId: number;
  coach?: Coach;
  locationId: number;
  location?: Location;
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
  locationId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  studentIds?: number[];
}

export interface ClassEnrollment {
  id: number;
  studentId: number;
  student?: Student;
  classId: number;
  class?: Class;
  joinedAt?: Date;
}