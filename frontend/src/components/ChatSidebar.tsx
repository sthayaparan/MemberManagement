'use client';

import { useState } from 'react';
import { HiOutlineChatBubbleLeftRight, HiOutlineXMark, HiOutlinePaperAirplane } from 'react-icons/hi2';
import { aiService, ChatMessage, AIResponse } from '@/services/aiService';
import { memberService } from '@/services/memberService';
import { Button } from './Button';

// Performs the CRUD action the AI decided on, then notifies listeners
// (e.g. the members list) to refetch via a 'members:changed' event.
async function applyAiAction(response: AIResponse): Promise<void> {
  if (!response.action || !response.member) return;
  const m = response.member;

  if (response.action === 'create') {
    if (!m.firstName || !m.surname || !m.dateOfBirth || !m.postalCode || !m.mobileNumber) {
      throw new Error('The AI response was missing required member details.');
    }
    await memberService.createMember({
      firstName: m.firstName,
      surname: m.surname,
      dateOfBirth: m.dateOfBirth,
      postalCode: m.postalCode,
      mobileNumber: m.mobileNumber,
    });
  } else if (response.action === 'edit') {
    if (!m.id) throw new Error('The AI response was missing which member to edit.');
    const existing = await memberService.getMember(m.id);
    await memberService.updateMember(m.id, {
      firstName: m.firstName || existing.firstName,
      surname: m.surname || existing.surname,
      dateOfBirth: m.dateOfBirth || existing.dateOfBirth,
      postalCode: m.postalCode || existing.postalCode,
      mobileNumber: m.mobileNumber || existing.mobileNumber,
    });
  } else if (response.action === 'delete') {
    if (!m.id) throw new Error('The AI response was missing which member to delete.');
    await memberService.deleteMember(m.id);
  }

  window.dispatchEvent(new Event('members:changed'));
}

export function ChatSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const nextMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const members = await memberService.getAllMembers();
      const response = await aiService.chat(nextMessages, members);
      await applyAiAction(response);
      setMessages([...nextMessages, { role: 'assistant', content: response.message }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setMessages([...nextMessages, { role: 'assistant', content: message }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open AI chat"
        className="fixed bottom-6 right-6 z-40 p-4 bg-purple-secondary text-white rounded-full shadow-lg shadow-purple-secondary/40 hover:shadow-xl hover:scale-105 transition-all duration-200 ring-2 ring-accent-yellow/60"
      >
        <HiOutlineChatBubbleLeftRight className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white shadow-2xl border-l-2 border-accent-yellow flex flex-col">
      <div className="px-5 py-4 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-dark-navy to-slate-900 text-white">
        <h2 className="font-bold flex items-center gap-2">
          <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-accent-yellow" />
          Member Assistant
        </h2>
        <button onClick={() => setIsOpen(false)} aria-label="Close AI chat" className="hover:text-accent-yellow transition-colors">
          <HiOutlineXMark className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-text">
            Ask me to add, edit, or delete a member — e.g. &ldquo;Add a new member John Doe, DOB 1990-01-01, postcode SW1A 1AA, mobile 07700900000&rdquo;.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-4 py-2 rounded-lg text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-blue-primary text-white'
                : 'bg-slate-100 text-dark-navy'
            }`}
          >
            {m.content}
          </div>
        ))}
        {isLoading && <p className="text-sm text-gray-text">Thinking...</p>}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-primary text-sm"
        />
        <Button type="submit" size="md" disabled={isLoading} icon={<HiOutlinePaperAirplane className="w-4 h-4" />}>
          Send
        </Button>
      </form>
    </div>
  );
}
