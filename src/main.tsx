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
          colorBackground: '#000000',
          colorText: '#ffffff',
        }
      }}
      // 🔒 CONFIGURAÇÕES PARA USAR DOMÍNIO EXTERNO DO CLERK
      signInUrl={CLERK_LOCAL_CONFIG.signInUrl}
      signUpUrl={CLERK_LOCAL_CONFIG.signUpUrl}
      signInFallbackRedirectUrl={CLERK_LOCAL_CONFIG.signInFallbackRedirectUrl}
      afterSignUpUrl={CLERK_LOCAL_CONFIG.afterSignUpUrl}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)