import { Member, MemberFormData } from '@/types/Member';

// Use Next.js API routes as proxy to backend (avoids CORS issues)
const API_BASE_URL = '/api';

export const memberService = {
  async getAllMembers(): Promise<Member[]> {
    try {
      const url = `${API_BASE_URL}/members`;
      console.log(`[memberService] Fetching from: ${url}`);
      
      const response = await fetch(url);
      
      console.log(`[memberService] Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`[memberService] Response received:`, result);
      
      const members = result.data || result;
      
      if (!Array.isArray(members)) {
        throw new Error('API response is not an array');
      }
      
      return members;
    } catch (error) {
      console.error('[memberService] Error fetching members:', error);
      throw error;
    }
  },

  async getMember(id: number): Promise<Member> {
    try {
      const response = await fetch(`${API_BASE_URL}/members/${id}`);
      if (!response.ok) throw new Error('Failed to fetch member');
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error(`Error fetching member ${id}:`, error);
      throw error;
    }
  },

  async createMember(data: MemberFormData): Promise<Member> {
    try {
      const response = await fetch(`${API_BASE_URL}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create member');
      }
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  },

  async updateMember(id: number, data: MemberFormData): Promise<Member> {
    try {
      const response = await fetch(`${API_BASE_URL}/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update member');
      }
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error(`Error updating member ${id}:`, error);
      throw error;
    }
  },

  async deleteMember(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/members/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete member');
      }
    } catch (error) {
      console.error(`Error deleting member ${id}:`, error);
      throw error;
    }
  },
};
