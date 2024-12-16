/** @format */

import { CallToAction4 } from '@/components/ui/Cta4';
import { Hero } from '@/components/ui/Hero';
import { Companies } from '@/components/ui/Companies';
import { Footer } from '@/components/ui/Footer';
import { Team } from '@/components/ui/Team';
import { Problem } from '@/components/ui/Problem';
import { Solution } from '@/components/ui/Solution';
import { How_it_works } from '@/components/ui/How_it_works';

export default function Home() {
	return (
		<div className=''>
			<Hero />
			<Companies />
			<Problem />
			<Solution />
			<Team />
			<How_it_works />
			<CallToAction4 />
			<Footer />
		</div>
	);
}
