import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberList } from '@/components/MemberList';
import { Member } from '@/types/Member';

const members: Member[] = [
  {
    id: 1,
    firstName: 'John',
    surname: 'Smith',
    dateOfBirth: '1990-01-01',
    postalCode: 'SW1A 1AA',
    mobileNumber: '07700900000',
  },
];

describe('MemberList', () => {
  it('shows a loading state', () => {
    render(<MemberList members={[]} onDelete={vi.fn()} isLoading />);
    expect(screen.getByText(/loading members/i)).toBeInTheDocument();
  });

  it('shows an empty state when there are no members', () => {
    render(<MemberList members={[]} onDelete={vi.fn()} />);
    expect(screen.getByText(/no members found/i)).toBeInTheDocument();
  });

  it('renders member rows', () => {
    render(<MemberList members={members} onDelete={vi.fn()} />);
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Smith')).toBeInTheDocument();
    expect(screen.getByText('SW1A 1AA')).toBeInTheDocument();
  });

  it('calls onDelete with the member id', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<MemberList members={members} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
