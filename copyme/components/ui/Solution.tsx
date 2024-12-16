/** @format */
import HeroVideoDialog from '@/components/ui/hero-video-dialog';

export function Solution() {
	return (
		<section id='problematique'>
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
						videoSrc='https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb'
						thumbnailSrc='https://startup-template-sage.vercel.app/hero-light.png'
						thumbnailAlt='Hero Video'
					/>
					<HeroVideoDialog
						className='hidden dark:block'
						animationStyle='from-center'
						videoSrc='https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb'
						thumbnailSrc='https://startup-template-sage.vercel.app/hero-dark.png'
						thumbnailAlt='Hero Video'
					/>
				</div>
			</div>
		</section>
	);
}
