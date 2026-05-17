import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import Input from '@/ui/atoms/Input';
import { authApi } from '@/libs/app/api';
import { getErrorMessage } from '@/libs/app/utils';

type ConfirmState = 'checking' | 'success' | 'error' | 'missing';

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [state, setState] = useState<ConfirmState>(token ? 'checking' : 'missing');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) {
      setState('missing');
      return;
    }

    let cancelled = false;

    const confirm = async () => {
      setState('checking');
      setMessage('');

      try {
        await authApi.confirmEmail({ token });

        if (!cancelled) {
          setState('success');
        }
      } catch (error) {
        if (!cancelled) {
          setState('error');
          setMessage(getErrorMessage(error, (value) => value.en));
        }
      }
    };

    confirm();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = async () => {
    const targetEmail = email.trim();

    if (!targetEmail) {
      setMessage('Enter your email address.');
      return;
    }

    setResending(true);
    setResent(false);
    setMessage('');

    try {
      await authApi.resendConfirmationEmail({ email: targetEmail });
      setResent(true);
    } catch (error) {
      setMessage(getErrorMessage(error, (value) => value.en));
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft">
        <Link to="/" className="inline-flex items-center gap-3 text-foreground">
          <img src="/medsphere-logo.png" alt="MedSphere" className="h-10 w-auto" />
          <span className="text-lg font-semibold">MedSphere</span>
        </Link>

        <div className="mt-8 space-y-4">
          {state === 'checking' ? (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Confirming
              </p>
              <h1 className="text-2xl font-semibold text-foreground">Checking your email link</h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Please keep this page open while we confirm your account.
              </p>
            </>
          ) : null}

          {state === 'success' ? (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
                Confirmed
              </p>
              <h1 className="text-2xl font-semibold text-foreground">Your email is confirmed</h1>
              <p className="text-sm leading-6 text-muted-foreground">
                You can now log in with the email, username, and password from your welcome email.
              </p>
              <Link
                to="/login"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-95"
              >
                Go to login
              </Link>
            </>
          ) : null}

          {state === 'missing' || state === 'error' ? (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-danger">
                Needs confirmation
              </p>
              <h1 className="text-2xl font-semibold text-foreground">
                {state === 'missing' ? 'Confirmation token missing' : 'This link did not work'}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Request a new confirmation email and use the latest link you receive.
              </p>
              {message ? <p className="text-sm text-danger">{message}</p> : null}
              {resent ? (
                <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                  If the email exists and is not confirmed, a new confirmation email has been sent.
                </p>
              ) : null}
              <div className="space-y-3">
                <Input
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <div className="flex flex-wrap gap-3">
                  <Button type="button" loading={resending} onClick={handleResend}>
                    Resend email
                  </Button>
                  <Link
                    to="/login"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-transparent px-4 text-sm font-semibold text-foreground transition hover:bg-muted/75"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
