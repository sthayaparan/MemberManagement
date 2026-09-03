'use client';

import { useState, useCallback } from 'react';
import { Member, MemberFormData } from '@/types/Member';
import { memberService } from '@/services/memberService';

export function useMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await memberService.getAllMembers();
      setMembers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch members';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMember = useCallback(async (data: MemberFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newMember = await memberService.createMember(data);
      setMembers([...members, newMember]);
      return newMember;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create member';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [members]);

  const updateMember = useCallback(async (id: number, data: MemberFormData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await memberService.updateMember(id, data);
      setMembers(members.map(m => m.id === id ? updated : m));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update member';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [members]);

  const deleteMember = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await memberService.deleteMember(id);
      setMembers(members.filter(m => m.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete member';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [members]);

  return {
    members,
    loading,
    error,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
  };
}
