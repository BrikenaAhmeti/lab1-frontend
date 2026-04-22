import { useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { bootstrapAuth } from '@/domain/auth/auth.thunks';
import { router } from '@/routes';

export default function App() {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector((s) => s.auth.initialized);
  const didBootstrap = useRef(false);
  const { t } = useTranslation('common');

  useEffect(() => {
    if (didBootstrap.current) return;
    didBootstrap.current = true;
    dispatch(bootstrapAuth());
  }, [dispatch]);

  if (!initialized) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">{t('loadingSession')}</div>;
  }

  return <RouterProvider router={router} />;
}
