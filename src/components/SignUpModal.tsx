import { SignUp } from '@clerk/clerk-react';
import { clerkLocalizationPTBR } from '../lib/clerkLocalizationPTBR';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <SignUp
          routing="virtual"
          signInUrl="/login"
          appearance={{
            variables: {
              colorPrimary: '#ec4899',
              colorBackground: '#000000',
              colorText: '#ffffff',
              colorTextSecondary: '#9ca3af',
              colorInputBackground: '#1f2937',
              colorBorder: '#374151',
              colorSuccess: '#10b981',
              colorDanger: '#ef4444',
              colorWarning: '#f59e0b',
              borderRadius: '0.75rem',
              fontFamily: 'Inter, system-ui, sans-serif'
            },
            elements: {
              card: {
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '1rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              },
              headerTitle: {
                color: '#ec4899',
                fontSize: '1.5rem',
                fontWeight: '700'
              },
              headerSubtitle: {
                color: '#9ca3af',
                fontSize: '0.875rem'
              },
              formButtonPrimary: {
                backgroundColor: '#ec4899',
                borderRadius: '0.75rem',
                fontWeight: '600',
                '&:hover': {
                  backgroundColor: '#db2777'
                }
              },
              socialButtonsBlockButton: {
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '0.75rem',
                color: '#ffffff',
                fontWeight: '500',
                '&:hover': {
                  backgroundColor: '#374151'
                }
              },
              formFieldInput: {
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                color: '#ffffff',
                '&:focus': {
                  borderColor: '#ec4899',
                  boxShadow: '0 0 0 1px #ec4899'
                }
              },
              formFieldLabel: {
                color: '#d1d5db',
                fontSize: '0.875rem',
                fontWeight: '500'
              },
              dividerLine: {
                backgroundColor: '#374151'
              },
              dividerText: {
                color: '#9ca3af',
                fontSize: '0.75rem'
              },
              footerActionLink: {
                color: '#ec4899',
                '&:hover': {
                  color: '#db2777'
                }
              }
            }
          }}
        />
        
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
