import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Overlay from './pages/Overlay';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/overlay" element={<Overlay />} />
    </Routes>
  );
}
