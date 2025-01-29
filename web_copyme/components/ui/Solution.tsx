/** @format */
'use client'

import HeroVideoDialog from '@/components/ui/hero-video-dialog';
import { Button } from './button';
import { useRouter } from 'next/navigation';

export function Solution() {
	const router = useRouter();

	return (
		<section id='problematique' className='bg-gray-100'>
			<div className='px-2 py-10 md:px-6 flex items-center justify-center flex-col'>
				<div className='mx-auto space-y-4 py-6 text-center'>
					<h2 className='font-mono text-[14px] font-medium tracking-tight text-primary'>
						Solution
					</h2>
				</div>
				<div className='relative w-4/5'>
					<HeroVideoDialog
						className='dark:hidden block'
						animationStyle='from-center'
						videoSrc='/beta.mp4'
						thumbnailSrc='/beta_preview.png'
						thumbnailAlt='Hero Video'
					/>
					<HeroVideoDialog
						className='hidden dark:block'
						animationStyle='from-center'
						videoSrc='/beta.mp4'
						thumbnailSrc='/beta_preview.png'
						thumbnailAlt='Hero Video'
					/>
				</div>
				<Button
					className='my-10'
					onClick={() => {
						router.push('/demo');
					}}>
					Testez maintenant !
				</Button>
			</div>
		</section>
	);
}
