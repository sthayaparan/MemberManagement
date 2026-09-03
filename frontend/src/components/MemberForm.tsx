'use client';

import { useState } from 'react';
import { HiOutlineUser, HiOutlineCalendarDays, HiOutlineMapPin, HiOutlineDevicePhoneMobile, HiOutlineCheck } from 'react-icons/hi2';
import { Member, MemberFormData } from '@/types/Member';
import { Button } from './Button';
import { Input } from './Input';
import { Card, CardBody, CardHeader } from './Card';
import { Alert } from './Alert';

interface MemberFormProps {
  onSubmit: (data: MemberFormData) => Promise<void>;
  initialData?: Member;
  isLoading?: boolean;
}

export function MemberForm({ onSubmit, initialData, isLoading }: MemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: initialData?.firstName || '',
    surname: initialData?.surname || '',
    // <input type="date"> requires exactly YYYY-MM-DD; the API returns an ISO datetime.
    dateOfBirth: initialData?.dateOfBirth.split('T')[0] || '',
    postalCode: initialData?.postalCode || '',
    mobileNumber: initialData?.mobileNumber || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.surname.trim()) {
      newErrors.surname = 'Surname is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setSuccessMessage(
        initialData
          ? 'Member updated successfully!'
          : 'Member created successfully!'
      );
      if (!initialData) {
        setFormData({
          firstName: '',
          surname: '',
          dateOfBirth: '',
          postalCode: '',
          mobileNumber: '',
        });
      }
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : 'An error occurred',
      });
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
          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage('')}
            />
          )}
          {errors.form && <Alert type="error" message={errors.form} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              type="text"
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
              value={formData.postalCode}
              onChange={handleChange}
              error={errors.postalCode}
              placeholder="12345"
              icon={<HiOutlineMapPin className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Mobile Number"
            name="mobileNumber"
            type="tel"
            value={formData.mobileNumber}
            onChange={handleChange}
            error={errors.mobileNumber}
            placeholder="555-0101"
            icon={<HiOutlineDevicePhoneMobile className="w-4 h-4" />}
          />

          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              isLoading={isLoading}
              icon={<HiOutlineCheck className="w-4 h-4" />}
              className="flex-1"
            >
              {isLoading ? 'Processing' : 'Submit'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
