import { describe, it, expect, beforeEach, vi } from 'vitest';
import { memberService } from '@/services/memberService';
import { Member } from '@/types/Member';

const member: Member = {
  id: 1,
  firstName: 'John',
  surname: 'Smith',
  dateOfBirth: '1985-05-15',
  postalCode: 'SW1A 1AA',
  mobileNumber: '07700900001',
};

function mockJson(body: unknown, ok = true, status = 200) {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok,
    status,
    json: async () => body,
  } as Response);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('memberService', () => {
  it('getAllMembers unwraps the { data } envelope', async () => {
    mockJson({ data: [member] });
    expect(await memberService.getAllMembers()).toEqual([member]);
  });

  it('getAllMembers throws the API error message on failure', async () => {
    mockJson({ error: 'Cannot reach the members service', code: 'BACKEND_UNAVAILABLE' }, false, 502);
    await expect(memberService.getAllMembers()).rejects.toThrow('Cannot reach the members service');
  });

  it('getMember unwraps the single member', async () => {
    mockJson({ data: member });
    expect(await memberService.getMember(1)).toEqual(member);
  });

  it('createMember returns the created member', async () => {
    mockJson({ data: member }, true, 201);
    expect(
      await memberService.createMember({
        firstName: 'John',
        surname: 'Smith',
        dateOfBirth: '1985-05-15',
        postalCode: 'SW1A 1AA',
        mobileNumber: '07700900001',
      })
    ).toEqual(member);
  });

  it('createMember surfaces a validation error', async () => {
    mockJson({ error: 'All fields are required', code: 'VALIDATION_ERROR' }, false, 400);
    await expect(
      memberService.createMember({
        firstName: '',
        surname: '',
        dateOfBirth: '',
        postalCode: '',
        mobileNumber: '',
      })
    ).rejects.toThrow('All fields are required');
  });

  it('deleteMember resolves on success', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true, status: 204 } as Response);
    await expect(memberService.deleteMember(1)).resolves.toBeUndefined();
  });
});
