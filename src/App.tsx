import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { SignedIn, UserButton } from '@clerk/clerk-react';

import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import PWAInstallBanner from './components/PWAInstallBanner';
import BottomTabBar from './components/BottomTabBar';
import Home from './pages/Home';

// Lazy imports para todas as páginas
const SetupProfile = lazy(() => import('./pages/SetupProfile'));
const Login = lazy(() => import('./pages/Login'));
const Patrocinadores = lazy(() => import('./pages/patrocinadores'));
const Sobre = lazy(() => import('./pages/sobre'));
const SelecaoTipoCadastro = lazy(() => import('./pages/SelecaoTipoCadastro'));
const Links = lazy(() => import('./pages/Links'));

// Páginas de perfil
const PerfilAtleta = lazy(() => import('./pages/perfil/atleta'));
const PerfilJudge = lazy(() => import('./pages/perfil/judge'));
const PerfilMidia = lazy(() => import('./pages/perfil/midia'));
const PerfilEspectador = lazy(() => import('./pages/perfil/espectador'));

// Páginas administrativas
const Marketing = lazy(() => import('./pages/marketing'));
const Admin = lazy(() => import('./pages/admin'));
const Dev = lazy(() => import('./pages/dev'));

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

          {/* Página de Links */}
          <Route path="/links" element={<Links />} />

          {/* Seleção de Tipo de Cadastro */}
          <Route
            path="/selecao-tipo-cadastro"
            element={
              <ProtectedRoute>
                <SelecaoTipoCadastro />
              </ProtectedRoute>
            }
          />

          {/* Páginas de Perfil */}
          <Route
            path="/perfil/atleta"
            element={
              <ProtectedRoute>
                <PerfilAtleta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil/judge"
            element={
              <ProtectedRoute>
                <PerfilJudge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil/midia"
            element={
              <ProtectedRoute>
                <PerfilMidia />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil/espectador"
            element={
              <ProtectedRoute>
                <PerfilEspectador />
              </ProtectedRoute>
            }
          />

          {/* Páginas Administrativas */}
          <Route
            path="/marketing"
            element={
              <ProtectedRoute>
                <Marketing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dev"
            element={
              <ProtectedRoute>
                <Dev />
              </ProtectedRoute>
            }
          />

          {/* Fallback para qualquer rota desconhecida */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      
      {/* Bottom Tab Bar iOS-like */}
      <BottomTabBar />
    </BrowserRouter>
  );
}
