/** @format */

'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

export default function DemoPage() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadedImage, setUploadedImage] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [angleData, setAngleData] = useState<any | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const fetchAngleData = async () => {
		if (!selectedFile) return;
		try {
			const response = await fetch(
				`http://127.0.0.1:5000/latest-angle-collection?video=${encodeURIComponent(
					selectedFile?.name,
				)}`,
			);

			if (!response.ok) {
				throw new Error('Erreur lors de la récupération des données.');
			}
			const data = await response.json();
			console.log(data);

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

		const formData = new FormData();
		formData.append('image', selectedFile);

		setLoading(true);
		try {
			const response = await fetch('http://127.0.0.1:5000/demo', {
				method: 'POST',
				body: formData,
			});

			if (response.ok) {
				fetchAngleData();

				const imageResponse = await fetch(
					`http://127.0.0.1:5000/image?filename=${encodeURIComponent(selectedFile.name)}`,
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
				const measuredAngles = angleData?.angles;
				const keypointsPositions = angleData?.keypoints_positions;

				if (measuredAngles && keypointsPositions) {
					measuredAngles.forEach(({ start_point, end_point, third_point, angle }: any) => {
						const start = keypointsPositions[start_point];
						const end = keypointsPositions[end_point];
						const third = keypointsPositions[third_point];

						if (start && end && third) {
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
			};

			img.src = uploadedImage;
		}
	}, [uploadedImage, angleData]);

	return (
		<div className={cn('w-screen h-screen', uploadedImage ? 'grid grid-cols-2' : '')}>
			<div className='h-full w-full flex flex-col items-center justify-center'>
				{uploadedImage ? (
					<div>
						<h1>Feedback</h1>
						{angleData?.feedback ? (
							angleData?.feedback.map((message: string, index: number) => {
								return <p key={index}>{message}</p>;
							})
						) : (
							<p>Aucun Feedback</p>
						)}
					</div>
				) : (
					<div>
						<h1>Télécharger une image</h1>
						<form onSubmit={handleSubmit} className='flex flex-col items-center justify-center'>
							<div style={{ marginBottom: '10px' }}>
								<input type='file' accept='image/*' onChange={handleFileChange} />
							</div>
							<Button type='submit' disabled={loading}>
								{loading ? 'Envoi en cours...' : 'Envoyer'}
							</Button>
						</form>
						{message && <p>{message}</p>}
					</div>
				)}
			</div>
			<div>
				{angleData && (
					<div style={{ marginTop: '20px', position: 'relative' }}>
						<h2>
							Il est en <label className='text-red-500'>{angleData.class_name}</label>
						</h2>
						<canvas ref={canvasRef} style={{ width: '640px', height: 'auto' }} />
					</div>
				)}
			</div>
		</div>
	);
}
