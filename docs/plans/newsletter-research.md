# Research — Newsletter sending voor tag.space

_Research date: 2026-04-23. Bron: meeting Daan 2026-04-27._

## TL;DR

**Beslissing: Resend Broadcasts op apart subdomein `mail.tag.space`.**

Blijf bij Resend (al in stack), maar splits sending over twee verified domains:
- `tag.space` → transactional (Supabase auth, product mails) — huidige setup behouden
- `mail.tag.space` → Broadcasts / nieuwsbrieven

Zonder die split riskeer je dat één spamklacht op een nieuwsbrief de reputatie van login-mails meesleurt.

## Setup

### Phase 1 (nu, <500 subs)
Resend Broadcasts op `mail.tag.space`. Gratis binnen free tier (1k contacts / 3k sends/maand). Geen extra tool te leren.

**Domain setup**:
1. Voeg `mail.tag.space` toe als nieuw verified domain in Resend
2. DNS records voor SPF / DKIM / DMARC op het subdomein
3. Broadcasts versturen alleen vanaf dit subdomein
4. Transactional blijft op `tag.space` zoals nu

### Phase 2 (bij 1k+ subs of deliverability-klachten)
Switch Broadcasts naar **MailerLite** (~$13,50/mnd tot ~2k subs, gratis tot 1k). Resend houden voor transactional.

Reden: MailerLite heeft aantoonbaar betere bulk deliverability op shared infra voor community/creator content. Niet-dev teamleden kunnen er zelf campagnes in maken.

## Niet doen

- **Loops** — $49/mnd is zonde bij deze schaal
- **Mailchimp** — slechtste prijs/waarde in 2026
- **Beehiiv** — creator-monetization framing irrelevant voor co-working community

## Vergelijking (500–2.000 subs)

| Tool | Gratis tier | ~2k subs prijs | Sterkte | Zwakte |
|------|-------------|----------------|---------|--------|
| **Resend Broadcasts** | 1k contacts / 3k sends | $40/mnd (5k) | In stack, dev-vriendelijk | Minder "echte" newsletter editor, reviews over strenge audits |
| **MailerLite** | 1k subs / 12k sends | ~$20/mnd | Beste prijs/kwaliteit, drag-drop | Losse tool, extra account |
| **Brevo** | 100k contacts, 300 sends/dag | ~$9-15/mnd | Veel contacts gratis | 300/dag cap pijnlijk voor bulk |
| **Beehiiv** | 2.5k subs gratis | $43/mnd | Referrals, ads marketplace | Overkill |
| **Buttondown** | 100 subs gratis | ~$29/mnd (2k+) | Markdown-first, privacy | Editor te tech voor niet-devs |
| **Loops** | 1k subs / 4k sends | $49/mnd | Mooie UI | Duur |
| **Mailchimp** | 250 subs / 500 sends | $13/mnd (500) → snel duur | Bekend | Uitgekleed gratis, duur bij groei |

## Verplicht ongeacht keuze

- **Double opt-in** (AVG/NL compliance)
- **One-click unsubscribe header** (Gmail/Yahoo blokkeren anders vanaf >5k sends)
- **List hygiene** — bounces verwijderen, inactieven opschonen
- **Warm-up** — eerste broadcasts naar engaged members, bouw volume langzaam op

## Bronnen

- [Resend pricing](https://resend.com/pricing)
- [Resend: subdomain vs root domain](https://resend.com/docs/knowledge-base/is-it-better-to-send-emails-from-a-subdomain-or-the-root-domain)
- [Resend Broadcasts](https://resend.com/features/broadcasts)
- [Suped: separating transactional vs marketing](https://www.suped.com/knowledge/email-deliverability/sender-reputation/should-i-separate-transactional-and-marketing-emails)
- [MailerLite vs Buttondown](https://www.getapp.com/all-software/a/mailerlite/compare/buttondown/)
- [Brevo free plan](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan)
- [Mailchimp 2026 changes](https://blog.groupmail.io/mailchimp-free-plan-changes-2026/)
