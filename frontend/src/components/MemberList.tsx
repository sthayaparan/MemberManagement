'use client';

import Link from 'next/link';
import { HiOutlinePencilSquare, HiOutlineTrash, HiOutlineUserGroup } from 'react-icons/hi2';
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
              <HiOutlineUserGroup className="w-8 h-8 text-blue-primary" />
            </div>
          </div>
          <p className="text-gray-text text-lg mb-2 font-medium">No members found.</p>
          <p className="text-gray-text text-sm mb-6">Get started by adding your first member</p>
          <Link href="/members/new">
            <Button variant="primary" icon={<HiOutlineUserGroup className="w-4 h-4" />}>
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
              <th className="px-6 py-4 text-right text-sm font-bold text-dark-navy w-px whitespace-nowrap">
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
                  {formatDate(member.dateOfBirth)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-text">{member.postalCode}</td>
                <td className="px-6 py-4 text-sm text-gray-text">{member.mobileNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/members/${member.id}`}
                      title="Edit member"
                      aria-label={`Edit ${member.firstName} ${member.surname}`}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-primary hover:bg-blue-primary hover:text-white transition-colors duration-150"
                    >
                      <HiOutlinePencilSquare className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      title="Delete member"
                      aria-label={`Delete ${member.firstName} ${member.surname}`}
                      onClick={() => onDelete(member.id)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-150"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
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

