import { BrowserRouter } from 'react-router-dom';
import AppRouter from '@/hms/router';

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
