import { describe, it, expect, beforeEach, vi } from 'vitest';
import { memberService } from '@/services/memberService';
import { Member } from '@/types/Member';

// Mock fetch globally
global.fetch = vi.fn();

describe('memberService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllMembers', () => {
    it('should fetch all members', async () => {
      const mockMembers: Member[] = [
        {
          id: 1,
          firstName: 'John',
          surname: 'Smith',
          dateOfBirth: '1985-05-15',
          postalCode: '12345',
          mobileNumber: '555-0101',
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMembers,
      } as Response);

      const result = await memberService.getAllMembers();
      expect(result).toEqual(mockMembers);
    });

    it('should throw error on failed fetch', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(memberService.getAllMembers()).rejects.toThrow();
    });
  });

  describe('createMember', () => {
    it('should create a new member', async () => {
      const newMember = {
        firstName: 'Jane',
        surname: 'Doe',
        dateOfBirth: '1990-03-22',
        postalCode: '54321',
        mobileNumber: '555-0102',
      };

      const createdMember: Member = {
        id: 2,
        ...newMember,
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => createdMember,
      } as Response);

      const result = await memberService.createMember(newMember);
      expect(result).toEqual(createdMember);
    });
  });
});
