import { test, expect, Page } from '@playwright/test';

// These specs stub the /api routes so they run without the backend or OpenRouter.

type Member = {
  id: number;
  firstName: string;
  surname: string;
  dateOfBirth: string;
  postalCode: string;
  mobileNumber: string;
};

const seed = (): Member[] => [
  { id: 1, firstName: 'John', surname: 'Smith', dateOfBirth: '1980-05-15', postalCode: 'SW1A 1AA', mobileNumber: '+44 7700 900001' },
  { id: 2, firstName: 'Jane', surname: 'Doe', dateOfBirth: '1985-08-22', postalCode: 'E1 6AN', mobileNumber: '+44 7700 900002' },
];

async function stubMembersApi(page: Page, aiResponse?: unknown) {
  const members = seed();
  let nextId = 3;

  await page.route('**/api/members', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      const created = { id: nextId++, ...body };
      members.push(created);
      return route.fulfill({ status: 201, json: { data: created } });
    }
    return route.fulfill({ status: 200, json: { data: members } });
  });

  await page.route('**/api/members/*', async (route) => {
    const id = Number(route.request().url().split('/').pop());
    const method = route.request().method();
    const idx = members.findIndex((m) => m.id === id);

    if (method === 'GET') {
      return idx === -1
        ? route.fulfill({ status: 404, json: { error: 'Member not found', code: 'MEMBER_NOT_FOUND' } })
        : route.fulfill({ status: 200, json: { data: members[idx] } });
    }
    if (method === 'PUT') {
      members[idx] = { ...members[idx], ...route.request().postDataJSON() };
      return route.fulfill({ status: 200, json: { data: members[idx] } });
    }
    if (method === 'DELETE') {
      members.splice(idx, 1);
      return route.fulfill({ status: 204, body: '' });
    }
    return route.continue();
  });

  if (aiResponse !== undefined) {
    await page.route('**/api/chat', (route) => route.fulfill({ status: 200, json: aiResponse }));
  }
}

test('lists seeded members', async ({ page }) => {
  await stubMembersApi(page);
  await page.goto('/');

  await expect(page.getByRole('cell', { name: 'John', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Doe', exact: true })).toBeVisible();
  await expect(page.getByText('Total Members')).toBeVisible();
});

test('adds a member', async ({ page }) => {
  await stubMembersApi(page);
  await page.goto('/');

  await page.getByRole('link', { name: 'Add Member' }).click();
  await expect(page).toHaveURL('/members/new');

  await page.getByLabel('First Name').fill('Alice');
  await page.getByLabel('Surname').fill('Walker');
  await page.getByLabel('Date of Birth').fill('1995-03-03');
  await page.getByLabel('Postal Code').fill('M1 1AE');
  await page.getByLabel('Mobile Number').fill('+44 7700 900009');
  await page.locator('form').getByRole('button', { name: 'Add Member' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('cell', { name: 'Alice', exact: true })).toBeVisible();
});

test('edits a member', async ({ page }) => {
  await stubMembersApi(page);
  await page.goto('/');

  await page.getByLabel('Edit John Smith').click();
  await expect(page).toHaveURL('/members/1');

  const firstName = page.getByLabel('First Name');
  await firstName.fill('Jonathan');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('cell', { name: 'Jonathan', exact: true })).toBeVisible();
});

test('deletes a member via the confirm modal', async ({ page }) => {
  await stubMembersApi(page);
  await page.goto('/');

  await page.getByLabel('Delete Jane Doe').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Delete' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole('cell', { name: 'Doe', exact: true })).toBeHidden();
});

test('AI chat creates a member and refreshes the list', async ({ page }) => {
  await stubMembersApi(page, {
    action: 'create',
    member: {
      firstName: 'Robot',
      surname: 'Made',
      dateOfBirth: '1990-01-01',
      postalCode: 'LS1 3AA',
      mobileNumber: '+44 7700 900123',
    },
    message: 'Added Robot Made.',
  });
  await page.goto('/');

  await page.getByLabel('Open AI chat').click();
  await page.getByPlaceholder('Type a message...').fill('add robot made');
  await page.getByRole('button', { name: 'Send' }).click();

  await expect(page.getByText('Added Robot Made.')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Robot', exact: true })).toBeVisible();
});
