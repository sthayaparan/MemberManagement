export interface Member {
  id: number;
  firstName: string;
  surname: string;
  dateOfBirth: string;
  postalCode: string;
  mobileNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberFormData {
  firstName: string;
  surname: string;
  dateOfBirth: string;
  postalCode: string;
  mobileNumber: string;
}
