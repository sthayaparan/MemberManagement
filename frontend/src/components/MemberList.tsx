'use client';

import Link from 'next/link';
import { FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import { Member } from '@/types/Member';
import { formatDate } from '@/utils/dateFormatter';
import { Button } from './Button';
import { Card, CardBody } from './Card';

interface MemberListProps {
  members: Member[];
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export function MemberList({ members, onDelete, isLoading }: MemberListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 border-4 border-blue-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-text font-medium">Loading members...</p>
        </CardBody>
      </Card>
    );
  }

  if (members.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-50 rounded-full">
              <FiUser className="w-8 h-8 text-blue-primary" />
            </div>
          </div>
          <p className="text-gray-text text-lg mb-2 font-medium">No members found.</p>
          <p className="text-gray-text text-sm mb-6">Get started by adding your first member</p>
          <Link href="/members/new">
            <Button variant="primary" icon={<FiUser className="w-4 h-4" />}>
              Add First Member
            </Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
              <th className="px-6 py-4 text-left text-sm font-bold text-dark-navy">
                First Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-dark-navy">
                Surname
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-dark-navy">
                Date of Birth
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-dark-navy">
                Postal Code
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-dark-navy">
                Mobile Number
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-dark-navy">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr
                key={member.id}
                className={`${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                } border-b border-slate-200 hover:bg-blue-50 transition-colors duration-150`}
              >
                <td className="px-6 py-4 text-sm font-medium text-dark-navy">
                  {member.firstName}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-dark-navy">
                  {member.surname}
                </td>
                <td className="px-6 py-4 text-sm text-gray-text">
                  {(() => {
                    const formatted = formatDate(member.dateOfBirth);
                    if (formatted === 'Invalid Date') {
                      console.warn(`[MemberList] Invalid date for member ${member.id}:`, member.dateOfBirth, 'raw:', JSON.stringify(member));
                    }
                    return formatted;
                  })()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-text">{member.postalCode}</td>
                <td className="px-6 py-4 text-sm text-gray-text">{member.mobileNumber}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <Link href={`/members/${member.id}`}>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<FiEdit2 className="w-4 h-4" />}
                      >
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={<FiTrash2 className="w-4 h-4" />}
                      onClick={() => onDelete(member.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
