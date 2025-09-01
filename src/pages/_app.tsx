import { ClerkProvider } from '@clerk/clerk-react'

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!

interface AppProps {
  Component: React.ComponentType<any>;
  pageProps: any;
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
