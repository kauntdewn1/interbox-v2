import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { SignedIn, UserButton } from '@clerk/clerk-react';

import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import PWAInstallBanner from './components/PWAInstallBanner';
import Home from './pages/Home';

const SetupProfile = lazy(() => import('./pages/SetupProfile'));
const Login = lazy(() => import('./pages/Login'));
const Patrocinadores = lazy(() => import('./pages/patrocinadores'));
const Sobre = lazy(() => import('./pages/Sobre'));

export default function App() {
  return (
    <BrowserRouter>
      <PWAInstallBanner />
      
      <header className="p-4 flex justify-end gap-4 bg-black border-b border-gray-800">
        <SignedIn>
          <UserButton afterSignOutUrl="/login" />
        </SignedIn>
      </header>

      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Rota pública */}
          <Route path="/" element={<Home />} />

          {/* Rota protegida para Setup de perfil */}
          <Route
            path="/setup"
            element={
              <ProtectedRoute>
                <SetupProfile />
              </ProtectedRoute>
            }
          />

          {/* Login público */}
          <Route path="/login" element={<Login />} />

          {/* Página Sobre */}
          <Route path="/sobre" element={<Sobre />} />

          {/* Página de Patrocinadores */}
          <Route path="/patrocinadores" element={<Patrocinadores />} />

          {/* TODO: Ativar rotas protegidas futuras */}
          {/*
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardEvento />
              </ProtectedRoute>
            }
          />
          */}

          {/* Fallback para qualquer rota desconhecida */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
