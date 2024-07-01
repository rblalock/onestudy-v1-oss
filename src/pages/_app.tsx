import '@/frontend/globals.css'

import { ClerkProvider } from "@clerk/nextjs";
import {
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react';
import { AppProps } from 'next/app';
import { Permanent_Marker as FontMarker,Plus_Jakarta_Sans as MainFont } from "next/font/google"
import Head from 'next/head';
import { useRouter } from 'next/router'
import posthog from 'posthog-js'
import { PostHogProvider, usePostHog } from 'posthog-js/react';
import * as React from 'react';
import { useEffect } from 'react';

import { Toaster } from "@/frontend/components/ui/toaster"
import { ThemeProvider } from '@/frontend/components/Utils/ThemeProvider';

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
		api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
		// Enable debug mode in development
		loaded: (posthog) => {
			if (process.env.NODE_ENV === 'development') posthog.debug()
		},
		capture_pageview: false // Disable automatic pageview capture, as we capture manually
	})
}

const mainFont = MainFont({
	subsets: ['latin'],
	variable: '--font-main',
});

const fontMarker = FontMarker({
	subsets: ["latin"],
	weight: '400',
	variable: "--font-marker",
});

const ConsentWrapper = (props: {
	children: React.ReactNode[] | React.ReactNode;
}) => {
	const posthog = usePostHog();

	return (
		<PostHogProvider client={posthog}>
			{props.children}
		</PostHogProvider>
	);
};

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
	const router = useRouter();
	const [queryClient] = React.useState(() => new QueryClient());

	useEffect(() => {
		const handleRouteChange = () => posthog?.capture('$pageview')
		router.events.on('routeChangeComplete', handleRouteChange)

		return () => {
			router.events.off('routeChangeComplete', handleRouteChange)
		}
	}, []);

	return (
		<>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
			</Head>

			<ConsentWrapper>
				<ClerkProvider 
					{...pageProps}
				>
					<QueryClientProvider client={queryClient}>
						<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
							<main className={`${mainFont.variable} ${fontMarker.variable} font-sans`}>
								<Component {...pageProps} />
								<Toaster />
							</main>
						</ThemeProvider>
					</QueryClientProvider>
				</ClerkProvider>

				<Analytics />
			</ConsentWrapper>
		</>
	);
}
