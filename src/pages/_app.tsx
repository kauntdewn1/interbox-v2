import { ClerkProvider } from '@clerk/clerk-react'

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!

interface AppProps {
  Component: React.ComponentType<Record<string, unknown>>;
  pageProps: Record<string, unknown>;
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
    >
      <Component {...pageProps} />
    </ClerkProvider>
  )
}
