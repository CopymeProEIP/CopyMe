/** @format */

'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useApi } from '@/lib/use-api';

export default function SignupForm() {
	const { toast } = useToast();
	const { callApi, isLoading } = useApi();
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[id === 'first-name' ? 'firstName' : id === 'last-name' ? 'lastName' : id]: value,
		}));
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const result = await callApi({
				url: 'auth/register',
				method: 'POST',
				body: {
					firstName: formData.firstName,
					lastName: formData.lastName,
					email: formData.email,
					password: formData.password,
				},
			});

			if (result) {
				toast({
					title: 'Compte créé avec succès',
					description: 'Vous allez être connecté automatiquement.',
				});

				await signIn('credentials', {
					email: formData.email,
					password: formData.password,
					callbackUrl: '/',
				});
			}
		} catch (error) {
			console.error('Signup error:', error);
		}
	};

	const handleProviderSignIn = (provider: string) => {
		signIn(provider, { callbackUrl: '/' });
	};

	return (
		<Card className='mx-auto max-w-sm'>
			<CardHeader>
				<CardTitle className='text-xl'>Inscription</CardTitle>
				<CardDescription>Entrez vos informations pour créer un compte et rejoindre la Newsletter</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className='grid gap-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='grid gap-2'>
							<Label htmlFor='first-name'>Prénom</Label>
							<Input
								id='first-name'
								placeholder='Jean'
								required
								value={formData.firstName}
								onChange={handleChange}
								disabled={isLoading}
							/>
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='last-name'>Nom</Label>
							<Input
								id='last-name'
								placeholder='Dupont'
								required
								value={formData.lastName}
								onChange={handleChange}
								disabled={isLoading}
							/>
						</div>
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='email'>Email</Label>
						<Input
							id='email'
							type='email'
							placeholder='jean.dupont@exemple.fr'
							required
							value={formData.email}
							onChange={handleChange}
							disabled={isLoading}
						/>
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='password'>Mot de passe</Label>
						<Input
							id='password'
							type='password'
							required
							value={formData.password}
							onChange={handleChange}
							disabled={isLoading}
						/>
					</div>
					<Button type='submit' className='w-full' disabled={isLoading}>
						{isLoading ? (
							<>
								<Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
								Création du compte...
							</>
						) : (
							'Créer un compte'
						)}
					</Button>

					{/* <div className='relative'>
						<div className='absolute inset-0 flex items-center'>
							<span className='w-full border-t' />
						</div>
						<div className='relative flex justify-center text-xs uppercase'>
							<span className='bg-background px-2 text-muted-foreground'>
								Ou s&apos;inscrire avec
							</span>
						</div>
					</div>

					<Button
						type='button'
						variant='outline'
						className='w-full'
						onClick={() => handleProviderSignIn('google')}
						disabled={isLoading}>
						<Icons.google className='w-4 h-4 mr-2' />
						S&apos;inscrire avec Google
					</Button>

					<Button
						type='button'
						variant='outline'
						className='w-full'
						onClick={() => handleProviderSignIn('apple')}
						disabled={isLoading}>
						<Icons.apple className='w-4 h-4 mr-2' />
						S&apos;inscrire avec Apple
					</Button> */}
				</form>
				<div className='mt-4 text-center text-sm'>
					Vous avez déjà un compte ?{' '}
					<Link href='/login' className='underline'>
						Se connecter
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
