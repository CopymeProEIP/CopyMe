/** @format */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export function CallToAction4() {
	const [form, setForm] = useState({ name: '', email: '', work: '', otherWork: '' });

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { id, value } = e.target;
		setForm((prevForm) => ({ ...prevForm, [id]: value }));
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log('Form Data:', form);
	};

	return (
		<section id='cta4' className='flex justify-center'>
			<div className='md:w-5/6 w-full h-[650px] px-8 md:px-14 py-10'>
				<div className='grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2'>
					<div className='flex flex-col justify-center space-y-4'>
						<div className='space-y-2'>
							<h1 className='text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none'>
								Participez à l&apos;aventure !
							</h1>
							<p className='max-w-[600px] text-muted-foreground md:text-xl'>
								Laissez-nous vos coordonnées si vous êtes intéressé ou curieux, et nous vous
								contacterons rapidement pour vous montrer comment vous pouvez contribuer à ce projet
								!
							</p>
						</div>
					</div>
					<div className='flex flex-col items-start gap-4 min-[400px]:flex-row lg:flex-col'>
						<div className='w-full space-y-4'>
							<form className='space-y-4' onSubmit={handleSubmit}>
								<div className='space-y-2'>
									<Label htmlFor='name'>Nom complet</Label>
									<Input
										id='name'
										placeholder='Entrez votre nom complet'
										onChange={handleChange}
										value={form.name}
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										placeholder='Entrez votre email'
										onChange={handleChange}
										value={form.email}
										required
										type='email'
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='work'>Vous êtes</Label>
									<select
										id='work'
										value={form.work}
										onChange={handleChange}
										required
										className='w-full px-3 py-2 border rounded-md'>
										<option value=''>Sélectionnez votre statut</option>
										<option value='coach'>Coach</option>
										<option value='professional'>Joueur professionnel</option>
										<option value='amateur'>Joueur amateur</option>
										<option value='other'>Autre</option>
									</select>
								</div>

								{form.work === 'other' && (
									<div className='space-y-2'>
										<Label htmlFor='otherWork'>Précisez votre statut</Label>
										<Input
											id='otherWork'
											placeholder='Indiquez votre statut'
											onChange={handleChange}
											value={form.otherWork}
										/>
									</div>
								)}

								<Button className='w-full' type='submit'>
									Participez
								</Button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
