'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Member, MemberFormData } from '@/types/Member';
import { memberService } from '@/services/memberService';
import { MemberForm } from '@/components/MemberForm';
import { Alert } from '@/components/Alert';
import { Card, CardBody } from '@/components/Card';

export default function EditMemberPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();

  const memberId = Number(params.id);
  const isValidId = Number.isInteger(memberId) && memberId > 0;

  useEffect(() => {
    if (!isValidId) {
      setError('Member not found');
      setIsLoading(false);
      return;
    }

    memberService
      .getMember(memberId)
      .then(setMember)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load member')
      )
      .finally(() => setIsLoading(false));
  }, [memberId, isValidId]);

  const handleSubmit = async (data: MemberFormData) => {
    await memberService.updateMember(memberId, data);
    router.push('/');
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-gray-text">Loading member...</p>
        </CardBody>
      </Card>
    );
  }

  if (error || !member) {
    return <Alert type="error" message={error ?? 'Member not found'} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <MemberForm onSubmit={handleSubmit} initialData={member} />
    </div>
  );
}
