import { Link } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import EmptyState from '@/ui/molecules/EmptyState';

const NotFound = () => {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-xl">
        <EmptyState
          title="Page not found"
          description="This page is not available or may have been moved."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/app">
                <Button>Go to Dashboard</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">Go to Login</Button>
              </Link>
            </div>
          }
        />
      </div>
    </main>
  );
};

export default NotFound;
