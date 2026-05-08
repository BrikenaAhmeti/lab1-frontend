import { jsx as _jsx } from "react/jsx-runtime";
import { BrowserRouter } from 'react-router-dom';
import AppRouter from '@/hms/router';
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(AppRouter, {}) }));
}
