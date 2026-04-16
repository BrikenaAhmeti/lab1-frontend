import { Link } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';

const NotFound = () => {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card
        title="Page Not Found"
        description="The page you are looking for does not exist or may have been moved."
        className="w-full max-w-lg"
      >
        <div className="mt-2 flex flex-wrap gap-2">
          <Link to="/app">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline">Go to Login</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
};

export default NotFound;
