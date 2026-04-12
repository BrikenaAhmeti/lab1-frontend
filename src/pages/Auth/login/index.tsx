import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import Input from '@/ui/atoms/Input';
import Card from '@/ui/atoms/Card';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { login } from '@/domain/auth/auth.thunks';

type RouteState = {
  from?: {
    pathname?: string;
  };
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { loading, error, user, tokens } = useAppSelector((s) => s.auth);
  const destination = ((location.state as RouteState | undefined)?.from?.pathname ?? '/app');

  useEffect(() => {
    if (user && tokens?.accessToken) {
      navigate('/app', { replace: true });
    }
  }, [navigate, tokens?.accessToken, user]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      navigate(destination, { replace: true });
    } catch {
      return;
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card
        title="Sign in"
        description="Use your account credentials to access the dashboard."
        className="w-full max-w-md"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button
            type="submit"
            loading={loading}
            className="w-full"
            disabled={!email || !password}
          >
            Sign in
          </Button>
          <p className="text-sm text-muted-foreground">
            No account yet?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Login;
