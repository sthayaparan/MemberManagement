import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatSidebar } from '@/components/ChatSidebar';
import { aiService } from '@/services/aiService';
import { memberService } from '@/services/memberService';

vi.mock('@/services/aiService', () => ({ aiService: { chat: vi.fn() } }));
vi.mock('@/services/memberService', () => ({
  memberService: {
    getAllMembers: vi.fn().mockResolvedValue([]),
    getMember: vi.fn(),
    createMember: vi.fn().mockResolvedValue({}),
    updateMember: vi.fn().mockResolvedValue({}),
    deleteMember: vi.fn().mockResolvedValue(undefined),
  },
}));

const chat = vi.mocked(aiService.chat);

async function open() {
  const user = userEvent.setup();
  render(<ChatSidebar />);
  await user.click(screen.getByLabelText('Open AI chat'));
  return user;
}

async function send(user: Awaited<ReturnType<typeof open>>, text: string) {
  await user.type(screen.getByPlaceholderText('Type a message...'), text);
  await user.click(screen.getByRole('button', { name: /send/i }));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(memberService.getAllMembers).mockResolvedValue([]);
});

describe('ChatSidebar', () => {
  it('runs a create action and notifies listeners', async () => {
    const changed = vi.fn();
    window.addEventListener('members:changed', changed);
    chat.mockResolvedValue({
      action: 'create',
      member: {
        firstName: 'John',
        surname: 'Smith',
        dateOfBirth: '1990-01-01',
        postalCode: 'SW1A 1AA',
        mobileNumber: '07700900000',
      },
      message: 'Added John Smith.',
    });

    const user = await open();
    await send(user, 'add john');

    await waitFor(() => expect(memberService.createMember).toHaveBeenCalled());
    expect(changed).toHaveBeenCalled();
    expect(await screen.findByText('Added John Smith.')).toBeInTheDocument();
    window.removeEventListener('members:changed', changed);
  });

  it('runs a delete action by id', async () => {
    chat.mockResolvedValue({ action: 'delete', member: { id: 7 }, message: 'Removed.' });

    const user = await open();
    await send(user, 'delete 7');

    await waitFor(() => expect(memberService.deleteMember).toHaveBeenCalledWith(7));
  });

  it('shows the error text when the AI request fails', async () => {
    chat.mockRejectedValue(new Error('AI chat is not configured'));

    const user = await open();
    await send(user, 'hello');

    expect(await screen.findByText('AI chat is not configured')).toBeInTheDocument();
  });

  it('just shows the message for a non-action reply', async () => {
    chat.mockResolvedValue({ action: null, message: 'How can I help?' });

    const user = await open();
    await send(user, 'hi');

    expect(await screen.findByText('How can I help?')).toBeInTheDocument();
    expect(memberService.createMember).not.toHaveBeenCalled();
  });
});
