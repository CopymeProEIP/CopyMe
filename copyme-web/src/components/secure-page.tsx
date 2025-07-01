/** @format */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Icons } from '@/components/icons';

interface SecurePageProps {
	children: React.ReactNode;
}

export default function SecurePage({ children }: SecurePageProps) {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/login');
		}
	}, [status, router]);

	if (status === 'loading') {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Icons.spinner className='h-10 w-10 animate-spin' />
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return <>{children}</>;
}
