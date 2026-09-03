import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberForm } from '@/components/MemberForm';
import { Member } from '@/types/Member';

describe('MemberForm', () => {
  it('shows validation errors when required fields are empty', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MemberForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Surname is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed form data when valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<MemberForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Surname'), 'Smith');
    await user.type(screen.getByLabelText('Date of Birth'), '1990-01-01');
    await user.type(screen.getByLabelText('Postal Code'), 'SW1A 1AA');
    await user.type(screen.getByLabelText('Mobile Number'), '07700900000');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      firstName: 'John',
      surname: 'Smith',
      dateOfBirth: '1990-01-01',
      postalCode: 'SW1A 1AA',
      mobileNumber: '07700900000',
    }));
  });

  it('pre-fills fields from initialData when editing', () => {
    const member: Member = {
      id: 1,
      firstName: 'Jane',
      surname: 'Doe',
      dateOfBirth: '1985-05-15',
      postalCode: 'E1 6AN',
      mobileNumber: '07700900001',
    };

    render(<MemberForm onSubmit={vi.fn()} initialData={member} />);

    expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /edit member/i })).toBeInTheDocument();
  });
});
