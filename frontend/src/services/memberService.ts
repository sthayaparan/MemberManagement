import { Member, MemberFormData } from '@/types/Member';

// Calls the same-origin Next.js proxy routes (app/api/members/*), never the
// backend directly. Every response body is the API envelope: { data } on
// success, { error, code } on failure.
const API_BASE_URL = '/api';

async function readError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null);
  return body?.error || `Request failed (${response.status})`;
}

export const memberService = {
  async getAllMembers(): Promise<Member[]> {
    const response = await fetch(`${API_BASE_URL}/members`);
    if (!response.ok) throw new Error(await readError(response));
    const { data } = await response.json();
    return data;
  },

  async getMember(id: number): Promise<Member> {
    const response = await fetch(`${API_BASE_URL}/members/${id}`);
    if (!response.ok) throw new Error(await readError(response));
    const { data } = await response.json();
    return data;
  },

  async createMember(data: MemberFormData): Promise<Member> {
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await readError(response));
    return (await response.json()).data;
  },

  async updateMember(id: number, data: MemberFormData): Promise<Member> {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await readError(response));
    return (await response.json()).data;
  },

  async deleteMember(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(await readError(response));
  },
};
