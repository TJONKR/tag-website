import type { Metadata } from 'next';

import { PageShell } from '@components/page-shell';
import { CampApplyForm } from '@lib/summer-camp/components';

const title = 'Apply · TAG Startup Summer Camp';
const description =
  'Apply solo or as a team. 30 spots. Applications close July 24, kickoff July 27.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export default function SummerCampApplyPage() {
  return (
    <PageShell>
      <section className="px-16 pb-24 pt-20 max-md:px-6 max-md:pt-12">
        <div className="mx-auto mb-14 max-w-[560px] text-center">
          <div className="mb-5 font-mono text-xs uppercase tracking-[0.22em] text-tag-orange">
            Startup Summer Camp · Applications close Jul 24
          </div>
          <h1 className="mb-5 font-syne text-[clamp(36px,6vw,56px)] font-extrabold uppercase leading-[1.0] text-tag-text">
            TAG <span className="text-tag-orange">in.</span>
          </h1>
          <p className="font-grotesk text-lg leading-relaxed text-tag-muted">
            Five minutes, honest answers. We review weekly and invite you for a short application
            call: your idea, your summer, the desk.
          </p>
        </div>

        {/* The numbers: what a desk costs */}
        <div className="mx-auto mb-16 max-w-[720px]">
          <span className="mb-4 block text-center font-mono text-[11px] uppercase tracking-[0.22em] text-tag-orange">
            What it costs
          </span>
          <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
            <div className="border border-tag-border bg-tag-card p-6">
              <div className="font-syne text-[26px] font-bold text-tag-text">€150</div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-tag-muted">
                per month
              </div>
              <p className="font-grotesk text-[14px] leading-relaxed text-tag-muted">
                The regular TAG desk rate. That&apos;s the baseline.
              </p>
            </div>
            <div className="border border-tag-orange bg-tag-card p-6">
              <div className="font-syne text-[26px] font-bold text-tag-orange">3 for 2</div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-tag-muted">
                camp deal
              </div>
              <p className="font-grotesk text-[14px] leading-relaxed text-tag-muted">
                Join the camp and get three months for the price of two: €300 for the whole summer
                and a month beyond it.
              </p>
            </div>
            <div className="border border-tag-border bg-tag-card p-6">
              <div className="font-syne text-[26px] font-bold text-tag-text">€0</div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-tag-muted">
                scholarships exist
              </div>
              <p className="font-grotesk text-[14px] leading-relaxed text-tag-muted">
                Money should never be the blocker. Flag it in the form and we&apos;ll figure it out
                on the call.
              </p>
            </div>
          </div>
        </div>

        <CampApplyForm />
      </section>
    </PageShell>
  );
}
