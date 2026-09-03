'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiUserPlus, FiCalendar, FiUsers } from 'react-icons/fi';
import { Member } from '@/types/Member';
import { memberService } from '@/services/memberService';
import { MemberList } from '@/components/MemberList';
import { Modal } from '@/components/Modal';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Card, CardBody } from '@/components/Card';

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMembers = async () => {
    console.log('[page.tsx] fetchMembers called');
    try {
      setIsLoading(true);
      setError(null);
      console.log('[page.tsx] Calling memberService.getAllMembers()...');
      const data = await memberService.getAllMembers();
      console.log('[page.tsx] Got data:', data);
      setMembers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load members';
      console.error('[page.tsx] Caught error:', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('[page.tsx] useEffect running, calling fetchMembers');
    fetchMembers();
  }, []);

  const handleDeleteClick = (id: number) => {
    setSelectedMemberId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedMemberId === null) return;

    try {
      setIsDeleting(true);
      await memberService.deleteMember(selectedMemberId);
      setMembers(members.filter((m) => m.id !== selectedMemberId));
      setDeleteModalOpen(false);
      setSelectedMemberId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete member';
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-5xl font-bold text-dark-navy mb-3 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-primary/20 to-purple-secondary/20 rounded-lg">
              <FiUsers className="w-8 h-8 text-blue-primary" />
            </div>
            Members Directory
          </h1>
          <p className="text-lg text-gray-text font-medium">
            Manage and organize all your members efficiently
          </p>
        </div>
        <Link href="/members/new">
          <Button
            variant="primary"
            size="lg"
            icon={<FiUserPlus className="w-5 h-5" />}
          >
            Add New Member
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Stats Cards */}
      {!isLoading && members.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardBody className="flex items-center justify-between py-6">
              <div>
                <p className="text-gray-text text-sm font-semibold uppercase tracking-wide">
                  Total Members
                </p>
                <p className="text-4xl font-bold text-dark-navy mt-2">{members.length}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <FiUsers className="w-8 h-8 text-blue-primary" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center justify-between py-6">
              <div>
                <p className="text-gray-text text-sm font-semibold uppercase tracking-wide">
                  Last Updated
                </p>
                <p className="text-lg text-blue-primary font-bold mt-2">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <FiCalendar className="w-8 h-8 text-emerald-600" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center justify-between py-6">
              <div>
                <p className="text-gray-text text-sm font-semibold uppercase tracking-wide">
                  Status
                </p>
                <p className="text-lg font-bold text-emerald-600 mt-2">Active</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="w-3 h-3 bg-emerald-100 rounded-full" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Member List */}
      <MemberList
        members={members}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        title="Delete Member"
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        isDanger
      >
        <p className="text-gray-text leading-relaxed">
          Are you sure you want to delete this member? This action cannot be undone and all associated data will be permanently removed.
        </p>
      </Modal>
    </div>
  );
}
