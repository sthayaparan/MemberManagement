'use client';

import Link from 'next/link';
import { HiOutlineUserGroup, HiOutlineUserPlus } from 'react-icons/hi2';
import { Button } from './Button';

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-dark-navy via-slate-900 to-slate-800 text-white shadow-lg border-b-2 border-accent-yellow">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-accent-yellow to-orange-400 rounded-lg group-hover:shadow-lg group-hover:shadow-accent-yellow/30 transition-shadow">
              <HiOutlineUserGroup className="w-6 h-6 text-dark-navy" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Member<span className="text-accent-yellow">Management</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="px-4 py-2.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors font-semibold text-sm uppercase tracking-wide flex items-center gap-2"
            >
              <HiOutlineUserGroup className="w-4 h-4" />
              Members
            </Link>
            <Link href="/members/new">
              <Button
                variant="primary"
                size="md"
                icon={<HiOutlineUserPlus className="w-4 h-4" />}
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

