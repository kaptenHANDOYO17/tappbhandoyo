/**
 *  ROOT COMPONENT + ROUTING (React Router DOM v6)
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

import GunungListPage from './pages/GunungListPage.jsx';
import GunungDetailPage from './pages/GunungDetailPage.jsx';
import AlatListPage from './pages/AlatListPage.jsx';
import AlatDetailPage from './pages/AlatDetailPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import MyGearPage from './pages/MyGearPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/gunung" replace />} />

          {/* Halaman List 1 & Detail 1 - bebas dibuka tanpa login */}
          <Route path="/gunung" element={<GunungListPage />} />
          <Route path="/gunung/:id" element={<GunungDetailPage />} />

          {/* Halaman List 2 & Detail 2 - bebas dibuka tanpa login */}
          <Route path="/alat" element={<AlatListPage />} />
          <Route path="/alat/:id" element={<AlatDetailPage />} />

          {/* Halaman yang menyimpan data pribadi - perlu masuk */}
          <Route
            path="/wishlist"
            element={
              <RequireAuth
                judul="Wishlist perlu akun"
                pesan="Dengan akun, daftar gunung impianmu tersimpan di server dan tetap ada walau ganti HP."
              >
                <WishlistPage />
              </RequireAuth>
            }
          />
          <Route
            path="/my-gear"
            element={
              <RequireAuth
                judul="My Gear perlu akun"
                pesan="Centang perlengkapanmu sekali, lalu bisa dibuka lagi kapan saja dari perangkat mana pun."
              >
                <MyGearPage />
              </RequireAuth>
            }
          />

          <Route
            path="/galeri"
            element={
              <RequireAuth
                judul="My Gallery perlu akun"
                pesan="Dengan akun, foto dan cerita pendakianmu tersimpan di server dan tidak hilang walau ganti HP."
              >
                <GalleryPage />
              </RequireAuth>
            }
          />

          {/* Profil: bisa dibuka tanpa login, isinya menyesuaikan */}
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/masuk" element={<LoginPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppLayout>
    </AuthProvider>
  );
}
