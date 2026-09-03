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

  const memberId = parseInt(params.id as string, 10);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const data = await memberService.getMember(memberId);
        setMember(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load member';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (memberId) {
      fetchMember();
    }
  }, [memberId]);

  const handleSubmit = async (data: MemberFormData) => {
    try {
      await memberService.updateMember(memberId, data);
      router.push('/');
    } catch (error) {
      throw error;
    }
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

  if (error) {
    return <Alert type="error" message={error} />;
  }

  if (!member) {
    return <Alert type="error" message="Member not found" />;
  }

  return (
    <div className="max-w-2xl">
      <MemberForm onSubmit={handleSubmit} initialData={member} />
    </div>
  );
}
