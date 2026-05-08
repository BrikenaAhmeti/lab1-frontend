import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import LanguageSwitch from '@/ui/molecules/LanguageSwitch';
import ThemeToggle from '@/ui/molecules/ThemeToggle';
import { commonCopy } from '../copy';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

const schema = z.object({
  identifier: z.string().trim().min(1, 'Please enter your email or username.'),
  password: z.string().trim().min(1, 'Please enter your password.'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ready, isAuthenticated, login, errorMessage } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const redirectTo = (location.state as { from?: string } | null)?.from || '/dashboard';

  if (ready && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:pt-8">
        <div className="flex justify-end gap-3">
          <ThemeToggle compact />
          <LanguageSwitch compact />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="ds-shell flex min-h-[280px] flex-col justify-between overflow-hidden p-8">
            <div className="inline-flex w-fit rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              HMS
            </div>
            <div className="py-8">
              <h1 className="max-w-xl text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                {t(commonCopy.appName)}
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
                {t(commonCopy.appSubtitle)}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background/65 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {t(commonCopy.todayAppointments)}
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">Live</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/65 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {t(commonCopy.availableRooms)}
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">Rooms</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/65 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {t(commonCopy.activeAdmissions)}
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">Care</p>
              </div>
            </div>
          </section>

          <Card title={t(commonCopy.loginTitle)} description={t(commonCopy.loginDescription)}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await login(values);
                  showToast(t(commonCopy.loginSuccess), 'success');
                  navigate(redirectTo, { replace: true });
                } catch (error) {
                  showToast(errorMessage(error), 'error');
                }
              })}
            >
              <Input
                label={t(commonCopy.identifier)}
                error={String(form.formState.errors.identifier?.message || '')}
                {...form.register('identifier')}
              />
              <Input
                type="password"
                label={t(commonCopy.password)}
                error={String(form.formState.errors.password?.message || '')}
                {...form.register('password')}
              />
              <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
                {t(commonCopy.signIn)}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}
