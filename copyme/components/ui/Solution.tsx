/** @format */
import HeroVideoDialog from '@/components/ui/hero-video-dialog';

export function Solution() {
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
						videoSrc='/video_pres.mp4'
						thumbnailSrc='/screen.png'
						thumbnailAlt='Hero Video'
					/>
					<HeroVideoDialog
						className='hidden dark:block'
						animationStyle='from-center'
						videoSrc='/video_pres.mp4'
						thumbnailSrc='/screen.png'
						thumbnailAlt='Hero Video'
					/>
				</div>
			</div>
		</section>
	);
}
