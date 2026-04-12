import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import Input from '@/ui/atoms/Input';
import Card from '@/ui/atoms/Card';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { register } from '@/domain/auth/auth.thunks';

const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, user, tokens } = useAppSelector((s) => s.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (user && tokens?.accessToken) {
      navigate('/app', { replace: true });
    }
  }, [navigate, tokens?.accessToken, user]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await dispatch(
        register({
          firstName,
          lastName,
          email,
          password,
          phoneNumber: phoneNumber || undefined,
        })
      ).unwrap();
      navigate('/app', { replace: true });
    } catch {
      return;
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card
        title="Create account"
        description="Register a new account and continue into the app."
        className="w-full max-w-md"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
            />
            <Input
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
            />
          </div>
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
            autoComplete="new-password"
            required
          />
          <Input
            type="tel"
            label="Phone number (optional)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            autoComplete="tel"
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button
            type="submit"
            loading={loading}
            className="w-full"
            disabled={!firstName || !lastName || !email || !password}
          >
            Register
          </Button>
          <p className="text-sm text-muted-foreground">
            Already registered?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Register;
