import { Member } from '@/types/Member';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// The model returns only the fields relevant to the action: everything for a
// create, "id" plus changed fields for an edit, just "id" for a delete.
export interface AIResponse {
  action?: 'create' | 'edit' | 'delete' | null;
  member?: {
    id?: number;
    firstName?: string;
    surname?: string;
    dateOfBirth?: string;
    postalCode?: string;
    mobileNumber?: string;
  };
  message: string;
}

// Calls our own server-side route (never OpenRouter directly) so the API key
// stays server-only and is never exposed to the browser bundle.
export const aiService = {
  async chat(messages: ChatMessage[], members: Member[]): Promise<AIResponse> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, members }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get AI response');
    }

    return response.json();
  },
};
