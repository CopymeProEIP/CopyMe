/** @format */

'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

export default function DemoPage() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [email, setEmail] = useState<string>('');
	const [uploadedImage, setUploadedImage] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [allowTraining, setAllowTraining] = useState<boolean>(true); // Checkbox pour entraîner l'IA
	const [angleData, setAngleData] = useState<any | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const fetchAngleData = async () => {
		if (!selectedFile) return;
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND}/latest-angle-collection?video=${encodeURIComponent(
					selectedFile?.name,
				)}`,
			);

			if (!response.ok) {
				throw new Error('Erreur lors de la récupération des données.');
			}
			const data = await response.json();

			if (data?.data) {
				setAngleData(data.data);
			}
		} catch (error) {
			console.error('Erreur:', error);
			setMessage('Une erreur est survenue lors de la récupération des données.');
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setSelectedFile(e.target.files[0]);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedFile) {
			setMessage('Veuillez sélectionner une image.');
			return;
		}

		if (!email || !/\S+@\S+\.\S+/.test(email)) {
			setMessage('Veuillez entrer une adresse email valide.');
			return;
		}

		const formData = new FormData();
		formData.append('image', selectedFile);
		formData.append('email', email);
		formData.append('allowTraining', allowTraining.toString());

		setLoading(true);
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/demo`, {
				method: 'POST',
				body: formData,
			});

			if (response.ok) {
				fetchAngleData();

				const imageResponse = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND}/image?filename=${encodeURIComponent(
						selectedFile.name,
					)}`,
				);

				if (imageResponse.ok) {
					const imageUrl = URL.createObjectURL(await imageResponse.blob());
					setUploadedImage(imageUrl);
					setMessage('Image téléchargée avec succès !');
				} else {
					setMessage("Erreur lors de l'affichage de l'image.");
				}
			} else {
				setMessage("Erreur lors du téléchargement de l'image.");
			}
		} catch (error) {
			console.error('Erreur:', error);
			setMessage('Une erreur est survenue.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (uploadedImage && canvasRef.current && angleData) {
			const canvas = canvasRef.current;
			const ctx = canvas.getContext('2d');
			const img = new Image();

			img.onload = () => {
				canvas.width = img.width;
				canvas.height = img.height;
				ctx?.drawImage(img, 0, 0);

				// Dessin des angles et des points sur le canvas
				ctx!.strokeStyle = 'blue';
				ctx!.lineWidth = 2;

				// Utilisation des angles mesurés du dernier document
				angleData?.frames[0]?.data?.forEach((item: any) => {
					const measuredAngles = item.angles;
					const keypointsPositions = item.keypoints_positions;
					console.log(measuredAngles, keypointsPositions);

					if (measuredAngles && keypointsPositions) {
						measuredAngles.forEach(({ start_point, end_point, third_point, angle }: any) => {
							const start = keypointsPositions[start_point];
							const end = keypointsPositions[end_point];
							const third = keypointsPositions[third_point];

							if (
								start &&
								end &&
								third &&
								start[0] &&
								end[0] &&
								third[0] &&
								start[1] &&
								end[1] &&
								third[1]
							) {
								ctx!.beginPath();
								ctx!.fillStyle = 'rgba(255, 255, 0, 0.4)';
								ctx!.moveTo(start[0], start[1]);
								ctx!.lineTo(end[0], end[1]);
								ctx!.lineTo(third[0], third[1]);
								ctx!.closePath();
								ctx!.fill();
								ctx!.stroke();

								const text = `${Math.round(angle)}°`;
								ctx!.font = '16px Arial';
								ctx!.textBaseline = 'top';

								const textWidth = ctx!.measureText(text).width;
								const textHeight = 16;

								ctx!.fillStyle = 'rgba(255, 255, 0, 0.8)';
								ctx!.fillRect(end[0] + 8, end[1] - 20, textWidth + 6, textHeight + 4);

								ctx!.fillStyle = '#4B0082';
								ctx!.fillText(text, end[0] + 10, end[1] - 18);
							}
						});
					}
				});
			};
			img.src = uploadedImage;
		}
	}, [uploadedImage, angleData]);

	return (
		<div className={cn('w-screen h-screen', uploadedImage ? 'grid grid-cols-2' : '')}>
			<div className='h-full w-full flex flex-col items-center justify-center'>
				{uploadedImage && message ? (
					<div className='w-4/5'>
						<h2 className='text-lg font-bold mb-4'>Feedback</h2>
						{angleData?.frames[0]?.data[0]?.feedback?.map((msg: string, idx: number) => (
							<p key={idx}>{msg}</p>
						)) || <p>Aucun Feedback</p>}
						<Button
							onClick={() => {
								window.location.reload();
							}}
							className='my-4'>
							Selectionner une autre image
						</Button>
					</div>
				) : (
					<div className='w-4/5 flex flex-col gap-10 md:flex-row items-center justify-around'>
						<div>
							<h2 className='text-lg font-bold mb-4'>
								Conseils pour obtenir de meilleurs résultats
							</h2>
							<ul className='list-disc pl-6 text-sm space-y-2'>
								<li>Assurez-vous d&apos;être seul sur l&apos;image.</li>
								<li>
									Positionnez la caméra en diagonale par rapport au sujet pour un meilleur angle.
								</li>
								<li>
									Notez que cette application est une version alpha et n&apos;est pas le produit
									final.
								</li>
								{/* <li>
									L&apos;image téléchargée pourra être utilisée pour entraîner le modèle, sous réserve
									d&apos;acceptation.
								</li> */}
							</ul>
						</div>
						<div className='flex flex-col items-start justify-center'>
							<h1 className='text-xl font-bold mb-4'>Analysez une image</h1>
							<form onSubmit={handleSubmit} className='flex flex-col items-center'>
								<div className='flex flex-col mb-4 w-full'>
									<input
										type='email'
										placeholder='Votre email'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className='mb-4 p-2 border border-gray-300 rounded'
									/>
									<input type='file' accept='image/*' onChange={handleFileChange} />
								</div>
								<div className='mb-4 flex items-center'>
									<input
										type='checkbox'
										checked={allowTraining}
										onChange={(e) => setAllowTraining(e.target.checked)}
										className='mr-2'
									/>
									<label>
										J&apos;autorise l&apos;utilisation de cette image pour entraîner l&apos;IA
										copyme.
									</label>
								</div>
								<Button type='submit' disabled={loading} >
									{loading ? 'Traitement en cours...' : 'Envoyer'}
								</Button>
							</form>
							{message && <p className='text-red-500 mt-4'>{message}</p>}
						</div>
					</div>
				)}
			</div>
			<div>
				{angleData?.frames[0]?.data[0] && (
					<div style={{ marginTop: '20px', position: 'relative' }}>
						<h2>
							Vous êtes en{' '}
							<span className='text-red-500'>{angleData.frames[0].data[0].class_name}</span>
						</h2>
						<canvas ref={canvasRef} style={{ width: '640px', height: 'auto' }} />
					</div>
				)}
			</div>
		</div>
	);
}
