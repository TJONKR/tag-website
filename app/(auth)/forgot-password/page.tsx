import { ForgotPasswordForm } from './forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-tag-bg p-6">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-tag-text">Forgot password</h3>
          <p className="text-sm text-tag-muted">
            Enter your email and we&apos;ll send you a link to reset it.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
