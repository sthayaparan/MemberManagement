'use client';

import { useState } from 'react';
import {
  HiOutlineUser,
  HiOutlineCalendarDays,
  HiOutlineMapPin,
  HiOutlineDevicePhoneMobile,
  HiOutlineCheck,
} from 'react-icons/hi2';
import { Member, MemberFormData } from '@/types/Member';
import { Button } from './Button';
import { Input } from './Input';
import { Card, CardBody, CardHeader } from './Card';
import { Alert } from './Alert';

interface MemberFormProps {
  // Resolves once the member is saved. The parent navigates away on success,
  // so this component only needs to surface validation and submit errors.
  onSubmit: (data: MemberFormData) => Promise<void>;
  initialData?: Member;
}

const EMPTY: MemberFormData = {
  firstName: '',
  surname: '',
  dateOfBirth: '',
  postalCode: '',
  mobileNumber: '',
};

export function MemberForm({ onSubmit, initialData }: MemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>(
    initialData
      ? {
          firstName: initialData.firstName,
          surname: initialData.surname,
          // <input type="date"> needs exactly YYYY-MM-DD; the API returns an ISO datetime.
          dateOfBirth: initialData.dateOfBirth.split('T')[0],
          postalCode: initialData.postalCode,
          mobileNumber: initialData.mobileNumber,
        }
      : EMPTY
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!formData.firstName.trim()) next.firstName = 'First name is required';
    if (!formData.surname.trim()) next.surname = 'Surname is required';
    if (!formData.postalCode.trim()) next.postalCode = 'Postal code is required';
    if (!formData.mobileNumber.trim()) next.mobileNumber = 'Mobile number is required';
    if (!formData.dateOfBirth) {
      next.dateOfBirth = 'Date of birth is required';
    } else if (formData.dateOfBirth > new Date().toISOString().slice(0, 10)) {
      next.dateOfBirth = 'Date of birth cannot be in the future';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'An error occurred' });
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold text-dark-navy flex items-center gap-2">
          <HiOutlineUser className="w-6 h-6 text-blue-primary" />
          {initialData ? 'Edit Member' : 'Add New Member'}
        </h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.form && <Alert type="error" message={errors.form} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              type="text"
              maxLength={100}
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              placeholder="John"
              icon={<HiOutlineUser className="w-4 h-4" />}
            />

            <Input
              label="Surname"
              name="surname"
              type="text"
              maxLength={100}
              value={formData.surname}
              onChange={handleChange}
              error={errors.surname}
              placeholder="Smith"
              icon={<HiOutlineUser className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              error={errors.dateOfBirth}
              icon={<HiOutlineCalendarDays className="w-4 h-4" />}
            />

            <Input
              label="Postal Code"
              name="postalCode"
              type="text"
              maxLength={20}
              value={formData.postalCode}
              onChange={handleChange}
              error={errors.postalCode}
              placeholder="SW1A 1AA"
              icon={<HiOutlineMapPin className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Mobile Number"
            name="mobileNumber"
            type="tel"
            maxLength={20}
            value={formData.mobileNumber}
            onChange={handleChange}
            error={errors.mobileNumber}
            placeholder="+44 7700 900000"
            icon={<HiOutlineDevicePhoneMobile className="w-4 h-4" />}
          />

          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              icon={<HiOutlineCheck className="w-4 h-4" />}
              className="flex-1"
            >
              {initialData ? 'Save Changes' : 'Add Member'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
