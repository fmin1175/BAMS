export interface Coach {
  id: number;
  name: string;
  hourlyRate: number;
  payoutMethod: string;
  bankDetails?: string;
  contactNumber: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CoachFormData {
  name: string;
  hourlyRate: number;
  payoutMethod: string;
  bankDetails?: string;
  contactNumber: string;
  email?: string;
}

export interface Availability {
  id: number;
  coachId: number;
  date: Date;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AvailabilityFormData {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}