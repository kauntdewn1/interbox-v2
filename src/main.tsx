import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { CLERK_LOCAL_CONFIG } from './lib/clerk'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      // Força modo production e desabilita development mode
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#ec4899',
          colorBackground: '#111827',
          colorText: '#ffffff',
          colorTextSecondary: '#d1d5db',
          colorInputBackground: '#1f2937',
          colorBorder: '#4b5563',
          colorInputText: '#ffffff',
          colorNeutral: '#6b7280',
          colorSuccess: '#10b981',
          colorDanger: '#ef4444',
          colorWarning: '#f59e0b',
          borderRadius: '0.5rem',
        },
        elements: {
          card: {
            backgroundColor: '#111827',
            border: '1px solid #374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
          },
          headerTitle: {
            color: '#ec4899',
            fontSize: '1.5rem',
            fontWeight: '700',
          },
          headerSubtitle: {
            color: '#d1d5db',
            fontSize: '0.875rem',
          },
          formFieldLabel: {
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: '500',
          },
          formFieldInput: {
            backgroundColor: '#1f2937',
            border: '1px solid #4b5563',
            color: '#ffffff',
            '&:focus': {
              borderColor: '#ec4899',
              boxShadow: '0 0 0 2px rgba(236, 72, 153, 0.2)',
            },
          },
          formButtonPrimary: {
            backgroundColor: '#ec4899',
            color: '#ffffff',
            fontWeight: '600',
            '&:hover': {
              backgroundColor: '#db2777',
            },
          },
          formButtonSecondary: {
            backgroundColor: '#374151',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#4b5563',
            },
          },
          footerActionText: {
            color: '#d1d5db',
          },
          footerActionLink: {
            color: '#ec4899',
            '&:hover': {
              color: '#db2777',
            },
          },
        }
      }}
      // 🔒 CONFIGURAÇÕES PARA USAR DOMÍNIO EXTERNO DO CLERK
      signInUrl={CLERK_LOCAL_CONFIG.signInUrl}
      signUpUrl={CLERK_LOCAL_CONFIG.signUpUrl}
      signInFallbackRedirectUrl={CLERK_LOCAL_CONFIG.signInFallbackRedirectUrl}
      signUpFallbackRedirectUrl={CLERK_LOCAL_CONFIG.signUpFallbackRedirectUrl}
      
      // 🚫 DESABILITAR TELA DE CONFIGURAÇÃO PADRÃO DO CLERK
      afterSignInUrl="/"
      afterSignUpUrl="/selecao-tipo-cadastro"
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)