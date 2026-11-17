/**
 *  ROOT COMPONENT + ROUTING (React Router DOM v6)
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import GunungListPage from './pages/GunungListPage.jsx';
import GunungDetailPage from './pages/GunungDetailPage.jsx';
import AlatListPage from './pages/AlatListPage.jsx';
import AlatDetailPage from './pages/AlatDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        {/* Halaman utama diarahkan ke daftar gunung */}
        <Route path="/" element={<Navigate to="/gunung" replace />} />

        {/* Halaman List 1 & Detail 1 */}
        <Route path="/gunung" element={<GunungListPage />} />
        <Route path="/gunung/:id" element={<GunungDetailPage />} />

        {/* Halaman List 2 & Detail 2 */}
        <Route path="/alat" element={<AlatListPage />} />
        <Route path="/alat/:id" element={<AlatDetailPage />} />

        {/* Halaman Profile / About */}
        <Route path="/profil" element={<ProfilePage />} />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}
