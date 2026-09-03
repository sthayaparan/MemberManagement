'use client';

import { useRouter } from 'next/navigation';
import { MemberFormData } from '@/types/Member';
import { memberService } from '@/services/memberService';
import { MemberForm } from '@/components/MemberForm';

export default function NewMemberPage() {
  const router = useRouter();

  const handleSubmit = async (data: MemberFormData) => {
    try {
      await memberService.createMember(data);
      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <MemberForm onSubmit={handleSubmit} />
    </div>
  );
}
