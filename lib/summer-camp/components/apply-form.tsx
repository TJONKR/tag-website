'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Label } from '@components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Checkbox } from '@components/ui/checkbox';

import type { CampApplicationInput, TeamMemberInput } from '@lib/summer-camp/schema';

const REFERRAL_OPTIONS = ['Twitter/X', 'LinkedIn', 'Friend', 'MEGATHON', 'Event', 'Other'];

const STAGE_OPTIONS = [
  { value: 'ambition', label: 'I want to do startups, no product yet' },
  { value: 'half_product', label: 'I have an idea and half a product' },
  { value: 'shipped_no_revenue', label: 'I shipped, no revenue yet' },
  { value: 'shipped_revenue', label: 'I shipped, first revenue is in' },
];

const labelClass = 'font-mono text-[12px] uppercase tracking-[0.08em] text-tag-muted';

const inputClass =
  'border-tag-border bg-tag-card text-tag-text placeholder:text-tag-dim focus-visible:ring-tag-orange';

const radioCardClass = (active: boolean) =>
  `cursor-pointer border p-4 font-grotesk text-[15px] leading-relaxed transition-colors ${
    active
      ? 'border-tag-orange bg-tag-card text-tag-text'
      : 'border-tag-border bg-tag-card text-tag-muted hover:border-tag-dim'
  }`;

export const CampApplyForm = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const emptyMember = (): TeamMemberInput => ({ name: '', email: '', linkUrl: '' });

  const [applyingAs, setApplyingAs] = useState<'solo' | 'team'>('solo');
  const [teamMembers, setTeamMembers] = useState<TeamMemberInput[]>([emptyMember()]);

  const updateMember = (index: number, field: keyof TeamMemberInput, value: string) => {
    setTeamMembers((members) =>
      members.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };
  const [stage, setStage] = useState<string>('');
  const [deskCommitment, setDeskCommitment] = useState<'committed' | 'discuss_on_call' | ''>('');
  const [openToTeam, setOpenToTeam] = useState(true);
  const [deskInterestRegardless, setDeskInterestRegardless] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!stage) {
      setErrors({ stage: 'Pick the option closest to where you are' });
      return;
    }
    if (!deskCommitment) {
      setErrors({ deskCommitment: 'Pick one. This is the commitment question' });
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: CampApplicationInput = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      linkUrl: (formData.get('linkUrl') as string) || '',
      applyingAs,
      teamMembers: applyingAs === 'team' ? teamMembers : undefined,
      openToTeam: applyingAs === 'solo' ? openToTeam : undefined,
      stage: stage as CampApplicationInput['stage'],
      building: formData.get('building') as string,
      shippedBefore: (formData.get('shippedBefore') as string) || undefined,
      hoursPerWeek: formData.get('hoursPerWeek') as string,
      awayDates: (formData.get('awayDates') as string) || undefined,
      septemberVision: formData.get('septemberVision') as string,
      deskCommitment,
      deskInterestRegardless,
      referral: (formData.get('referral') as string) || undefined,
    };

    try {
      const res = await fetch('/api/summer-camp/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.errors) {
          const fieldErrors: Record<string, string> = {};
          for (const err of json.errors) {
            if (err.path?.[0]) {
              fieldErrors[err.path[0]] = err.message;
            }
          }
          setErrors(fieldErrors);
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setErrors({ form: 'Something went wrong. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-[560px] border border-tag-border bg-tag-card p-10 text-center">
        <div className="mb-4 font-syne text-3xl font-bold text-tag-orange">
          You&apos;re in line.
        </div>
        <p className="font-grotesk text-tag-muted">
          We review applications every week and get back to you fast. Next step is a short
          application call, where we talk about your idea, your summer, and the desk.
        </p>
        <p className="mt-4 font-grotesk text-sm text-tag-dim">Kickoff is July 27. Keep it free.</p>
        <Link
          href="/summer-camp"
          className="mt-8 inline-block font-mono text-xs uppercase tracking-[0.2em] text-tag-orange"
        >
          &larr; Back to Summer Camp
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-[560px] flex-col gap-7">
      {/* Contact */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className={labelClass}>
          Name
        </Label>
        <Input id="name" name="name" required className={inputClass} placeholder="Your name" />
        {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className={labelClass}>
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          className={inputClass}
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="linkUrl" className={labelClass}>
          Link: LinkedIn, GitHub, portfolio or product (optional)
        </Label>
        <Input id="linkUrl" name="linkUrl" className={inputClass} placeholder="https://" />
        {errors.linkUrl && <p className="text-sm text-red-400">{errors.linkUrl}</p>}
      </div>

      {/* Solo or team */}
      <div className="flex flex-col gap-2">
        <span className={labelClass}>Applying as</span>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={radioCardClass(applyingAs === 'solo')}
            onClick={() => setApplyingAs('solo')}
          >
            Solo
          </button>
          <button
            type="button"
            className={radioCardClass(applyingAs === 'team')}
            onClick={() => setApplyingAs('team')}
          >
            With a team
          </button>
        </div>
      </div>

      {applyingAs === 'team' ? (
        <div className="flex flex-col gap-4">
          <p className="font-grotesk text-[14px] text-tag-dim">
            You&apos;re person one. Add the rest of your team, this applies for all of you.
          </p>
          {teamMembers.map((member, i) => (
            <div key={i} className="border border-tag-border bg-tag-bg-deep p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-tag-orange">
                  Person {i + 2}
                </span>
                {teamMembers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setTeamMembers((m) => m.filter((_, idx) => idx !== i))}
                    className="font-mono text-[11px] uppercase tracking-[0.15em] text-tag-dim transition-colors hover:text-red-400"
                  >
                    Remove ×
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`member-${i}-name`} className={labelClass}>
                    Name
                  </Label>
                  <Input
                    id={`member-${i}-name`}
                    required
                    className={inputClass}
                    placeholder="Their name"
                    value={member.name}
                    onChange={(e) => updateMember(i, 'name', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`member-${i}-email`} className={labelClass}>
                    Email
                  </Label>
                  <Input
                    id={`member-${i}-email`}
                    type="email"
                    required
                    className={inputClass}
                    placeholder="them@example.com"
                    value={member.email}
                    onChange={(e) => updateMember(i, 'email', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`member-${i}-link`} className={labelClass}>
                    Link: LinkedIn, GitHub, portfolio or product (optional)
                  </Label>
                  <Input
                    id={`member-${i}-link`}
                    className={inputClass}
                    placeholder="https://"
                    value={member.linkUrl}
                    onChange={(e) => updateMember(i, 'linkUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          {teamMembers.length < 3 && (
            <button
              type="button"
              onClick={() => setTeamMembers((m) => [...m, emptyMember()])}
              className="border border-dashed border-tag-border p-4 font-mono text-[12px] uppercase tracking-[0.15em] text-tag-muted transition-colors hover:border-tag-orange hover:text-tag-orange"
            >
              + Add extra person
            </button>
          )}
          {errors.teamMembers && <p className="text-sm text-red-400">{errors.teamMembers}</p>}
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-3">
          <Checkbox
            checked={openToTeam}
            onCheckedChange={(v) => setOpenToTeam(v === true)}
            className="border-tag-border data-[state=checked]:bg-tag-orange data-[state=checked]:text-tag-bg-deep"
          />
          <span className="font-grotesk text-[15px] text-tag-muted">
            I&apos;m open to teaming up at kickoff
          </span>
        </label>
      )}

      {/* Stage */}
      <div className="flex flex-col gap-2">
        <span className={labelClass}>Where are you now?</span>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder="Pick the closest one" />
          </SelectTrigger>
          <SelectContent>
            {STAGE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.stage && <p className="text-sm text-red-400">{errors.stage}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="building" className={labelClass}>
          What are you building, or what do you want to build?
        </Label>
        <Textarea
          id="building"
          name="building"
          required
          className={inputClass}
          placeholder="One paragraph. Rough is fine."
        />
        {errors.building && <p className="text-sm text-red-400">{errors.building}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="shippedBefore" className={labelClass}>
          What have you shipped before? Anything counts (optional)
        </Label>
        <Textarea
          id="shippedBefore"
          name="shippedBefore"
          className={inputClass}
          placeholder="Apps, side projects, a newsletter, a market stall. Anything"
        />
      </div>

      {/* Commitment */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="hoursPerWeek" className={labelClass}>
          Hours per week you&apos;ll realistically put in
        </Label>
        <Input
          id="hoursPerWeek"
          name="hoursPerWeek"
          required
          className={inputClass}
          placeholder="Be honest. This is between us"
        />
        {errors.hoursPerWeek && <p className="text-sm text-red-400">{errors.hoursPerWeek}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="awayDates" className={labelClass}>
          Away between July 27 and September 4? When? (optional)
        </Label>
        <Input
          id="awayDates"
          name="awayDates"
          className={inputClass}
          placeholder="e.g. one week mid-August"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="septemberVision" className={labelClass}>
          It&apos;s September 4 and it worked. What are you looking at?
        </Label>
        <Textarea
          id="septemberVision"
          name="septemberVision"
          required
          className={inputClass}
          placeholder="Paint it. Revenue, users, the feeling. Your version of 'it worked'"
        />
        {errors.septemberVision && <p className="text-sm text-red-400">{errors.septemberVision}</p>}
      </div>

      {/* The desk */}
      <div className="border border-tag-border bg-tag-bg-deep p-5">
        <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-tag-orange">
          The desk: read this
        </span>
        <p className="mb-4 font-grotesk text-[14.5px] leading-relaxed text-tag-muted">
          A desk at TAG is part of joining the camp. It&apos;s how we keep everyone in the room, and
          it&apos;s the commitment we ask. The numbers are at the top of this page: three months for
          the price of two, and scholarships exist.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className={radioCardClass(deskCommitment === 'committed')}
            onClick={() => setDeskCommitment('committed')}
          >
            I&apos;m in, desk included. Count me in.
          </button>
          <button
            type="button"
            className={radioCardClass(deskCommitment === 'discuss_on_call')}
            onClick={() => setDeskCommitment('discuss_on_call')}
          >
            I want in, but the desk cost could be a problem. Let&apos;s discuss it on the call.
          </button>
        </div>
        {errors.deskCommitment && (
          <p className="mt-2 text-sm text-red-400">{errors.deskCommitment}</p>
        )}
        <label className="mt-4 flex cursor-pointer items-center gap-3">
          <Checkbox
            checked={deskInterestRegardless}
            onCheckedChange={(v) => setDeskInterestRegardless(v === true)}
            className="border-tag-border data-[state=checked]:bg-tag-orange data-[state=checked]:text-tag-bg-deep"
          />
          <span className="font-grotesk text-[14.5px] text-tag-muted">
            Even if I don&apos;t get into the camp, I&apos;m interested in a desk at TAG on this
            deal.
          </span>
        </label>
      </div>

      {/* Referral */}
      <div className="flex flex-col gap-2">
        <Label className={labelClass}>How did you hear about this? (optional)</Label>
        <Select name="referral">
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {REFERRAL_OPTIONS.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {errors.form && <p className="text-sm text-red-400">{errors.form}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 whitespace-nowrap bg-tag-orange px-12 py-5 font-grotesk text-lg font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b] disabled:opacity-60"
      >
        {loading ? 'Sending…' : 'TAG in →'}
      </button>
      <p className="text-center font-mono text-[11px] uppercase tracking-[0.15em] text-tag-dim">
        30 spots · Applications close July 24
      </p>
    </form>
  );
};
