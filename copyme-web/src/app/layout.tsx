/** @format */

import { Inter } from 'next/font/google';
import { TailwindIndicator } from '@/components/tailwind-indicator';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn, constructMetadata } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = constructMetadata({
	title: "CopyMe - Améliore tes performances grâce à l'analyse vidéo par IA",
	description:
		"CopyMe t'aide à améliorer tes mouvements sportifs grâce à l'analyse vidéo par intelligence artificielle.",
});

export const viewport: Viewport = {
	colorScheme: 'light',
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: 'white' },
		// { media: '(prefers-color-scheme: dark)', color: 'black' },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='fr' suppressHydrationWarning>
			<head>
				<link rel='preconnect' href='https://rsms.me/' />
				<link rel='stylesheet' href='https://rsms.me/inter/inter.css' />
			</head>
			<body
				className={cn(
					'min-h-screen bg-background antialiased w-full mx-auto scroll-smooth',
					inter.className,
				)}>
				<ThemeProvider attribute='class' defaultTheme='light' enableSystem={false}>
					<Providers>{children}</Providers>
					<ThemeToggle />
					<TailwindIndicator />
				</ThemeProvider>
			</body>
		</html>
	);
}
