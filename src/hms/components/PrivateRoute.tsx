import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { commonCopy } from '../copy';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function PrivateRoute() {
  const location = useLocation();
  const { ready, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-sm text-muted-foreground">
        {t(commonCopy.loadingSession)}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
