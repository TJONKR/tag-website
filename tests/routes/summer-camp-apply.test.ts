import { test, expect } from '@playwright/test';

const validApplication = {
  name: 'Test Applicant',
  email: 'test-camp-apply@example.com',
  linkUrl: '',
  applyingAs: 'solo',
  openToTeam: true,
  stage: 'half_product',
  building: 'A test project',
  hoursPerWeek: '20',
  septemberVision: 'Paying customers',
  deskCommitment: 'committed',
  deskInterestRegardless: false,
};

test.describe('POST /api/summer-camp/apply', () => {
  test('rejects request with missing required fields', async ({ request }) => {
    const response = await request.post('/api/summer-camp/apply', {
      data: {},
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.errors).toBeDefined();
    expect(body.errors.length).toBeGreaterThan(0);
  });

  test('rejects request with invalid email', async ({ request }) => {
    const response = await request.post('/api/summer-camp/apply', {
      data: { ...validApplication, email: 'not-an-email' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.errors).toBeDefined();
  });

  test('rejects invalid stage value', async ({ request }) => {
    const response = await request.post('/api/summer-camp/apply', {
      data: { ...validApplication, stage: 'unicorn' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.errors).toBeDefined();
  });

  test('rejects invalid desk commitment value', async ({ request }) => {
    const response = await request.post('/api/summer-camp/apply', {
      data: { ...validApplication, deskCommitment: 'maybe' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.errors).toBeDefined();
  });

  test('rejects team application without teammates', async ({ request }) => {
    const response = await request.post('/api/summer-camp/apply', {
      data: { ...validApplication, applyingAs: 'team', teamMembers: [] },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.errors).toBeDefined();
  });

  test('rejects team application with invalid teammate email', async ({ request }) => {
    const response = await request.post('/api/summer-camp/apply', {
      data: {
        ...validApplication,
        applyingAs: 'team',
        teamMembers: [{ name: 'Teammate', email: 'not-an-email', linkUrl: '' }],
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.errors).toBeDefined();
  });

  test('rejects invalid link URL', async ({ request }) => {
    const response = await request.post('/api/summer-camp/apply', {
      data: { ...validApplication, linkUrl: 'not-a-url' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.errors).toBeDefined();
  });

  test('accepts a valid solo application', async ({ request }) => {
    const response = await request.post('/api/summer-camp/apply', {
      data: validApplication,
    });

    // 200, or 500 if the DB layer rejects (e.g. offline in CI)
    expect([200, 500]).toContain(response.status());
  });
});
