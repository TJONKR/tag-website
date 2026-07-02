import { z } from 'zod';

export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  linkUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;

export const campApplicationSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    linkUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),

    applyingAs: z.enum(['solo', 'team']),
    teamMembers: z.array(teamMemberSchema).max(5).optional(),
    openToTeam: z.boolean().optional(),

    stage: z.enum(['ambition', 'half_product', 'shipped_no_revenue', 'shipped_revenue']),
    building: z.string().min(1, 'Tell us what you want to build'),
    shippedBefore: z.string().optional(),

    hoursPerWeek: z.string().min(1, 'Tell us how many hours you can realistically put in'),
    awayDates: z.string().optional(),
    septemberVision: z.string().min(1, 'Tell us what September 4 looks like if this works'),

    deskCommitment: z.enum(['committed', 'discuss_on_call']),
    deskInterestRegardless: z.boolean().optional(),

    referral: z.string().optional(),
  })
  .refine((data) => data.applyingAs !== 'team' || (data.teamMembers?.length ?? 0) > 0, {
    message: 'Add at least one teammate',
    path: ['teamMembers'],
  });

export type CampApplicationInput = z.infer<typeof campApplicationSchema>;
