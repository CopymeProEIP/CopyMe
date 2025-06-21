/** @format */

'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function LoginForm() {
	const { toast } = useToast();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setIsLoading(true);

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				toast({
					title: "Erreur d'authentification",
					description: 'Vérifiez vos identifiants et réessayez.',
					variant: 'destructive',
				});
			} else {
				window.location.href = '/';
			}
		} catch (error) {
			toast({
				title: 'Une erreur est survenue',
				description: 'Veuillez réessayer plus tard.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	}

	const handleProviderSignIn = (provider: string) => {
		signIn(provider, { callbackUrl: '/' });
	};

	return (
		<Card className='mx-auto max-w-sm'>
			<CardHeader>
				<CardTitle className='text-2xl'>Connexion</CardTitle>
				<CardDescription>Entrez votre email pour vous connecter à votre compte</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='grid gap-4'>
					<Button
						variant='outline'
						className='w-full'
						onClick={() => handleProviderSignIn('google')}
						disabled={isLoading}>
						<Icons.google className='w-4 h-4 mr-2' />
						Connexion avec Google
					</Button>
					<Button
						variant='outline'
						className='w-full'
						onClick={() => handleProviderSignIn('apple')}
						disabled={isLoading}>
						<Icons.apple className='w-4 h-4 mr-2' />
						Connexion avec Apple
					</Button>
					<div className='relative'>
						<div className='absolute inset-0 flex items-center'>
							<span className='w-full border-t' />
						</div>
						<div className='relative flex justify-center text-xs uppercase'>
							<span className='bg-background px-2 text-muted-foreground'>Ou continuer avec</span>
						</div>
					</div>

					<form onSubmit={handleSubmit} className='grid gap-4'>
						<div className='grid gap-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								placeholder='m@example.com'
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={isLoading}
							/>
						</div>
						<div className='grid gap-2'>
							<div className='flex items-center'>
								<Label htmlFor='password'>Mot de passe</Label>
								<Link href='#' className='ml-auto inline-block text-sm underline'>
									Mot de passe oublié?
								</Link>
							</div>
							<Input
								id='password'
								type='password'
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={isLoading}
							/>
						</div>
						<Button type='submit' className='w-full' disabled={isLoading}>
							{isLoading ? (
								<>
									<Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
									Connexion...
								</>
							) : (
								'Se connecter'
							)}
						</Button>
					</form>
				</div>
				<div className='mt-4 text-center text-sm'>
					Pas encore de compte?{' '}
					<Link href='/signup' className='underline'>
						S&apos;inscrire
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
