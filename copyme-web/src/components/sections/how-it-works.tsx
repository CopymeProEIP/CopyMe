/** @format */

import Features from '@/components/features-vertical';
import Section from '@/components/section';
import { Sparkles, Upload, Zap } from 'lucide-react';

const data = [
  {
    id: 1,
    title: "Inscrivez-vous",
    content: "Commencez par vous inscrire sur notre site pour rejoindre l'aventure CopyMe.",
    image: "/formulaire.png",
    icon: <Upload className="w-6 h-6 text-primary" />,
  },
  {
    id: 2,
    title: "Recevez un lien Drive",
    content:
      "Une fois inscrit, vous serez ajouté à notre newsletter et recevrez un lien Google Drive pour contribuer au projet.",
    image: "/upload.png",
    icon: <Zap className="w-6 h-6 text-primary" />,
  },
  {
    id: 3,
    title: "Partagez vos vidéos",
    content:
      "Envoyez des vidéos de vous, vos amis ou vos joueurs pendant l’entraînement. Chaque vidéo compte !",
    image: "/training.png",
    icon: <Sparkles className="w-6 h-6 text-primary" />,
  },
];


export default function Component() {
	return (
		<Section title='Comment contribuer au projet ?' subtitle='Juste 3 étapes pour y contribuer'>
			<Features data={data} />
		</Section>
	);
}
