/** @format */

import { Icons } from '@/components/icons';
import { FaTwitter } from 'react-icons/fa';
import { FaYoutube } from 'react-icons/fa6';
import { RiInstagramFill } from 'react-icons/ri';

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
	name: 'Copyme.ai',
	description: 'Analysez, progressez avec CopyMe, l’application d’analyse vidéo par IA pour le basketball.',
	url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
	keywords: ['SaaS', 'Template', 'Next.js', 'React', 'Tailwind CSS'],
	links: {
		email: 'support@copymepro.fr',
		twitter: '#',
		discord: '#',
		github: '#',
		instagram: '#',
	},
	header: [
		{
			trigger: 'Produits',
			content: {
				main: {
					icon: <Icons.logo className='h-6 w-6' />,
					title: "Analyse basée sur l'IA",
					description: 'Améliore ton jeu grâce à l’analyse vidéo par IA',
					href: '/demo',
				},
				items: [
					// {
					//   href: "/demo",
					//   title: "Task Automation",
					//   description: "Automate repetitive tasks and save time.",
					// },
				],
			},
		},
		// {
		//   trigger: "Solutions",
		//   content: {
		//     items: [
		//       {
		//         title: "For Small Businesses",
		//         href: "#",
		//         description: "Tailored automation solutions for growing companies.",
		//       },
		//       {
		//         title: "Enterprise",
		//         href: "#",
		//         description: "Scalable AI automation for large organizations.",
		//       },
		//       {
		//         title: "Developers",
		//         href: "#",
		//         description: "API access and integration tools for developers.",
		//       },
		//       {
		//         title: "Healthcare",
		//         href: "#",
		//         description: "Specialized automation for healthcare workflows.",
		//       },
		//       {
		//         title: "Finance",
		//         href: "#",
		//         description: "AI-driven process automation for financial services.",
		//       },
		//       {
		//         title: "Education",
		//         href: "#",
		//         description:
		//           "Streamline administrative tasks in educational institutions.",
		//       },
		//     ],
		//   },
		// },
		{
			href: '/blog',
			label: 'Blog',
		},
	],
	pricing: [
		{
			name: 'BASIC',
			href: '#',
			price: '$19',
			period: 'month',
			yearlyPrice: '$16',
			features: [
				'1 User',
				'5GB Storage',
				'Basic Support',
				'Limited API Access',
				'Standard Analytics',
			],
			description: 'Perfect for individuals and small projects',
			buttonText: 'Subscribe',
			isPopular: false,
		},
		{
			name: 'PRO',
			href: '#',
			price: '$49',
			period: 'month',
			yearlyPrice: '$40',
			features: [
				'5 Users',
				'50GB Storage',
				'Priority Support',
				'Full API Access',
				'Advanced Analytics',
			],
			description: 'Ideal for growing businesses and teams',
			buttonText: 'Subscribe',
			isPopular: true,
		},
		{
			name: 'ENTERPRISE',
			href: '#',
			price: '$99',
			period: 'month',
			yearlyPrice: '$82',
			features: [
				'Unlimited Users',
				'500GB Storage',
				'24/7 Premium Support',
				'Custom Integrations',
				'AI-Powered Insights',
			],
			description: 'For large-scale operations and high-volume users',
			buttonText: 'Subscribe',
			isPopular: false,
		},
	],
	faqs: [
		{
			question: 'Qu’est-ce que CopyMe ?',
			answer: (
				<span>
					CopyMe est une application qui utilise l’intelligence artificielle pour analyser vos
					mouvements en vidéo et vous aider à progresser en basketball. Elle fournit des retours
					personnalisés pour améliorer votre technique.
				</span>
			),
		},
		{
			question: 'Comment commencer avec CopyMe ?',
			answer: (
				<span>
					Il suffit de vous inscrire sur notre site et de suivre les étapes. Vous pourrez ensuite
					envoyer vos vidéos d’entraînement et recevoir des retours d’analyse via notre plateforme.
				</span>
			),
		},
		{
			question: 'Est-ce que CopyMe fonctionne pour tous les niveaux ?',
			answer: (
				<span>
					Oui, CopyMe s’adresse aussi bien aux débutants qu’aux joueurs confirmés. Notre IA s’adapte
					à votre niveau pour vous proposer un accompagnement pertinent et progressif.
				</span>
			),
		},
		{
			question: 'Quels types de vidéos puis-je envoyer ?',
			answer: (
				<span>
					Vous pouvez filmer vos entraînements, vos matchs ou même des exercices spécifiques.
					L’important est que le joueur soit visible en pied pour une bonne analyse des mouvements.
				</span>
			),
		},
		{
			question: 'Quel accompagnement proposez-vous ?',
			answer: (
				<span>
					Nous proposons des retours vidéo automatiques, des suggestions d’amélioration, et un suivi
					de votre progression dans le temps. D’autres fonctionnalités arrivent bientôt !
				</span>
			),
		},
	],
	footer: [
		{
			title: 'Produit',
			links: [
				{ href: '#', text: 'Produits', icon: null },
				// { href: "#", text: "Prix", icon: null },
				// { href: "#", text: "Documentation", icon: null },
				// { href: "#", text: "API", icon: null },
			],
		},
		{
			title: 'Company',
			links: [
				{ href: '#', text: 'About Us', icon: null },
				// { href: "#", text: "Careers", icon: null },
				{ href: '#', text: 'Blog', icon: null },
				// { href: "#", text: "Press", icon: null },
				{ href: '#', text: 'Partners', icon: null },
			],
		},
		{
			title: 'Resources',
			links: [
				// { href: "#", text: "Community", icon: null },
				{ href: '#', text: 'Contact', icon: null },
				// { href: "#", text: "Support", icon: null },
				// { href: "#", text: "Status", icon: null },
			],
		},
		{
			title: 'Social',
			links: [
				{
					href: '#',
					text: 'Twitter',
					icon: <FaTwitter />,
				},
				{
					href: '#',
					text: 'Instagram',
					icon: <RiInstagramFill />,
				},
				{
					href: '#',
					text: 'Youtube',
					icon: <FaYoutube />,
				},
			],
		},
	],
};

export type SiteConfig = typeof siteConfig;
