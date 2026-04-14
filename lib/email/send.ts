import type { ReactElement } from 'react'

import { getResendClient } from './client'
import { EMAIL_FROM } from './config'

export interface SendEmailInput {
  to: string | string[]
  subject: string
  react: ReactElement
  replyTo?: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
  /** Override default from address (rarely needed) */
  from?: string
  /** Tag for Resend analytics */
  tag?: string
}

export interface SendEmailResult {
  ok: boolean
  id?: string
  skipped?: boolean
  error?: string
}

/**
 * Send a transactional email. Never throws — failures are logged so that
 * email errors never break the mutation/webhook that triggered them.
 *
 * Returns `{ ok: false, skipped: true }` when RESEND_API_KEY is unset
 * (local dev without email setup).
 */
export const sendEmail = async (input: SendEmailInput): Promise<SendEmailResult> => {
  const client = getResendClient()

  if (!client) {
    // Silent no-op when email isn't configured — expected in local dev.
    if (process.env.NODE_ENV === 'development') {
      console.info('[email] RESEND_API_KEY not set — skipping', {
        subject: input.subject,
        to: input.to,
      })
    }
    return { ok: false, skipped: true }
  }

  try {
    const { data, error } = await client.emails.send({
      from: input.from ?? EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      react: input.react,
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
      ...(input.cc ? { cc: input.cc } : {}),
      ...(input.bcc ? { bcc: input.bcc } : {}),
      ...(input.attachments ? { attachments: input.attachments } : {}),
      ...(input.tag ? { tags: [{ name: 'category', value: input.tag }] } : {}),
    })

    if (error) {
      console.error('[email] send failed', {
        subject: input.subject,
        to: input.to,
        error: error.message,
      })
      return { ok: false, error: error.message }
    }

    return { ok: true, id: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    console.error('[email] send threw', {
      subject: input.subject,
      to: input.to,
      error: message,
    })
    return { ok: false, error: message }
  }
}
