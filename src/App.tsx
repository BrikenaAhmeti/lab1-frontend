import { useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { bootstrapAuth } from '@/domain/auth/auth.thunks';
import { router } from '@/routes';

export default function App() {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector((s) => s.auth.initialized);
  const didBootstrap = useRef(false);

  useEffect(() => {
    if (didBootstrap.current) return;
    didBootstrap.current = true;
    dispatch(bootstrapAuth());
  }, [dispatch]);

  if (!initialized) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading session...</div>;
  }

  return <RouterProvider router={router} />;
}
