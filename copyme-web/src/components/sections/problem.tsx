/** @format */

import BlurFade from '@/components/magicui/blur-fade';
import Section from '@/components/section';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, BarChart2, Brain, EyeOff, Shield, Zap } from 'lucide-react';

const problems = [
	{
		title: 'Mauvais gestes techniques',
		description:
			'Répéter des mouvements incorrects augmente le risque de blessures, notamment de troubles musculo-squelettiques (TMS), et freine la progression.',
		icon: AlertTriangle,
	},
	{
		title: 'Manque de feedback',
		description:
			'Sans retour précis, les joueurs ne savent pas s’ils exécutent correctement un mouvement, ce qui limite l’efficacité de l’entraînement.',
		icon: EyeOff,
	},
	{
		title: 'Progrès difficiles à mesurer',
		description:
			'Sans outils d’analyse, il est difficile de suivre ses améliorations, d’identifier ses points faibles et de rester motivé sur le long terme.',
		icon: BarChart2,
	},
];

export default function Component() {
	return (
		<Section
			title='Problèmes'
			subtitle='S’entraîner sans retour objectif limite vos progrès et augmente le risque de blessure.'>
			<div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-12'>
				{problems.map((problem, index) => (
					<BlurFade key={index} delay={0.2 + index * 0.2} inView>
						<Card className='bg-background border-none shadow-none'>
							<CardContent className='p-6 space-y-4'>
								<div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center'>
									<problem.icon className='w-6 h-6 text-primary' />
								</div>
								<h3 className='text-xl font-semibold'>{problem.title}</h3>
								<p className='text-muted-foreground'>{problem.description}</p>
							</CardContent>
						</Card>
					</BlurFade>
				))}
			</div>
		</Section>
	);
}
