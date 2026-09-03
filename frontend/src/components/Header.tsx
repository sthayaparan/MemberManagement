'use client';

import Link from 'next/link';
import { FiUsers, FiUserPlus } from 'react-icons/fi';
import { Button } from './Button';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-dark-navy via-slate-900 to-slate-800 text-white shadow-lg border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-r from-accent-yellow to-orange-400 rounded-lg group-hover:shadow-lg transition-shadow">
              <FiUsers className="w-6 h-6 text-dark-navy" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">Member</span>
              <span className="text-xs text-accent-yellow font-semibold tracking-wide">MANAGEMENT</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/members"
              className="px-4 py-2 text-white hover:text-accent-yellow transition-colors font-medium flex items-center gap-2"
            >
              <FiUsers className="w-4 h-4" />
              Members
            </Link>
            <Link href="/members/new">
              <Button
                variant="primary"
                size="md"
                icon={<FiUserPlus className="w-4 h-4" />}
              >
                Add Member
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
