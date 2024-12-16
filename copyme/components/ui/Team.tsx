/** @format */

import Marquee from '@/components/ui/marquee';
import Image from 'next/image';

const team = [
	{
		name: 'Idriss Said',
		role: 'Développeur & Co-Fondateur',
		desc: "Maman, ils m'ont mis une description",
		img_url: 'idriss',
	},
	{ name: 'Hasnain', role: 'Développeur & Co-Fondateur', desc: '', img_url: 'singe' },
	{ name: 'Lucas', role: 'Développeur & Co-Fondateur', desc: '', img_url: 'singe' },
	{ name: 'Junot', role: 'Développeur & Co-Fondateur', desc: '', img_url: 'singe' },
	{ name: 'Samuel', role: 'Développeur & Co-Fondateur', desc: '', img_url: 'singe' },
];

export function Team() {
	return (
		<section id='team'>
			<div className='md:px-4 py-4 flex flex-col justify-center items-center'>
				<div className='mx-auto space-y-4 py-6 text-center'>
					<h2 className='font-mono text-[14px] font-medium tracking-tight text-primary'>
						L&apos;équipe derrière ce projet
					</h2>
				</div>
				<div className='relative mt-6 md:w-3/4 w-full'>
					<Marquee className='max-w-full [--duration:40s]'>
						{team.map((member, idx) => (
							<div key={idx} className='w-[256px] flex flex-col gap-2'>
								<Image
									src={`/${member.img_url}.png`}
									width={256}
									height={350}
									className='object-cover dark:brightness-0 dark:invert'
									alt={member.name}
								/>
								<p className='scroll-m-20 text-2xl font-semibold tracking-tight leading-7'>
									{member.name}
								</p>

								<p className='leading-7'>{member.role}</p>
								<p className='border-l-2 pl-2 italic'>{member.desc}</p>
							</div>
						))}
					</Marquee>
					<div className='max-sm:hidden pointer-events-none absolute inset-y-0 left-0 h-full w-1/3 bg-gradient-to-r from-white dark:from-black'></div>
					<div className='max-sm:hidden pointer-events-none absolute inset-y-0 right-0 h-full w-1/3 bg-gradient-to-l from-white dark:from-black'></div>
				</div>
			</div>
		</section>
	);
}
