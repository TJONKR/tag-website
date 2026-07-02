import { createServerSupabaseClient } from '@lib/db';
import { sendApplicationNewAdmin } from '@lib/email/senders';

import type { CampApplicationInput } from './schema';

export const insertCampApplication = async (data: CampApplicationInput) => {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from('camp_applications').insert({
    name: data.name,
    email: data.email,
    link_url: data.linkUrl || null,
    applying_as: data.applyingAs,
    team_members: data.applyingAs === 'team' ? (data.teamMembers ?? []) : null,
    open_to_team: data.applyingAs === 'solo' ? (data.openToTeam ?? null) : null,
    stage: data.stage,
    building: data.building,
    shipped_before: data.shippedBefore || null,
    hours_per_week: data.hoursPerWeek,
    away_dates: data.awayDates || null,
    september_vision: data.septemberVision,
    desk_commitment: data.deskCommitment,
    desk_interest_regardless: data.deskInterestRegardless ?? false,
    referral: data.referral || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Reuse the membership-application admin notice; the "(Summer Camp)" suffix
  // in the name distinguishes camp applications in the admin inbox.
  await sendApplicationNewAdmin({
    applicantName: `${data.name} (Summer Camp)`,
    applicantEmail: data.email,
    building: data.building,
    whyTag: data.septemberVision,
    referral: data.referral || null,
  });
};
