'use client';

import { useEffect, useState } from 'react';
import { HiOutlineUserGroup } from 'react-icons/hi2';
import { Member } from '@/types/Member';
import { memberService } from '@/services/memberService';
import { MemberList } from '@/components/MemberList';
import { Modal } from '@/components/Modal';
import { Alert } from '@/components/Alert';
import { Card, CardBody } from '@/components/Card';

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setMembers(await memberService.getAllMembers());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // Refresh when the AI chat sidebar creates/edits/deletes a member.
    window.addEventListener('members:changed', fetchMembers);
    return () => window.removeEventListener('members:changed', fetchMembers);
  }, []);

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await memberService.deleteMember(deleteId);
      setMembers((current) => current.filter((m) => m.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete member');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-dark-navy mb-3 flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-primary/20 to-purple-secondary/20 rounded-lg">
            <HiOutlineUserGroup className="w-8 h-8 text-blue-primary" />
          </div>
          Members Directory
        </h1>
        <p className="text-lg text-gray-text font-medium">
          Manage and organize all your members efficiently
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {!isLoading && members.length > 0 && (
        <Card>
          <CardBody className="flex items-center justify-between py-6">
            <div>
              <p className="text-gray-text text-sm font-semibold uppercase tracking-wide">
                Total Members
              </p>
              <p className="text-4xl font-bold text-dark-navy mt-2">{members.length}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <HiOutlineUserGroup className="w-8 h-8 text-blue-primary" />
            </div>
          </CardBody>
        </Card>
      )}

      <MemberList
        members={members}
        onDelete={openDeleteModal}
        isLoading={isLoading}
      />

      <Modal
        isOpen={deleteId !== null}
        title="Delete Member"
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        isDanger
      >
        {deleteError && (
          <div className="mb-4">
            <Alert type="error" message={deleteError} />
          </div>
        )}
        <p className="text-gray-text leading-relaxed">
          Are you sure you want to delete this member? This action cannot be undone
          and all associated data will be permanently removed.
        </p>
      </Modal>
    </div>
  );
}
