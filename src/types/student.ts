export interface Student {
  id: number;
  name: string;
  dateOfBirth: Date;
  guardianName: string;
  contactNumber: string;
  medicalNotes?: string;
  registrationDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
  // Computed fields from API
  age?: number;
  contact?: string;
}

export interface StudentFormData {
  name: string;
  dateOfBirth: string;
  guardianName: string;
  contactNumber: string;
  medicalNotes?: string;
}