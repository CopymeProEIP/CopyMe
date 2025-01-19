/** @format */

'use client';
import { useState, useRef, useEffect } from 'react';

const data = {
	video: './uploads/a.jpg',
	frame_id: 'frame_13673396240',
	class_name: 'shot_realese',
	angles: [
		{
			start_point: 'L shoulder',
			end_point: 'L elbow',
			third_point: 'L wrist',
			angle: 143.7324676513672,
		},
		{
			start_point: 'R shoulder',
			end_point: 'R elbow',
			third_point: 'R wrist',
			angle: 156.35028076171875,
		},
		{
			start_point: 'L hip',
			end_point: 'L knee',
			third_point: 'L ankle',
			angle: 9.421517372131348,
		},
		{
			start_point: 'R hip',
			end_point: 'R knee',
			third_point: 'R ankle',
			angle: 7.432708740234375,
		},
	],
	keypoints_positions: {
		'L ear': [425.1186828613281, 469.4263916015625],
		'L shoulder': [397.8890075683594, 541.7139282226562],
		'R shoulder': [497.9461975097656, 545.1287231445312],
		'L elbow': [317.0858154296875, 446.38006591796875],
		'R elbow': [450.2495422363281, 475.37567138671875],
		'L wrist': [394.9574279785156, 359.9791564941406],
		'R wrist': [452.4640808105469, 383.2962951660156],
		'L hip': [412.70159912109375, 822.7384033203125],
		'R hip': [469.1563720703125, 822.0032958984375],
		'L knee': [424.2000427246094, 1028.01123046875],
		'R knee': [468.9736328125, 1016.0299072265625],
		'L ankle': [492.5244445800781, 1183.31787109375],
		'R ankle': [517.8238525390625, 1158.52978515625],
	},
	created_at: {
		$date: '2025-01-19T00:00:00.000Z',
	},
	version: 32,
};

export default function DemoPage() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadedImage, setUploadedImage] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);

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
				const blob = await response.blob();
				const imageUrl = URL.createObjectURL(blob);
				setUploadedImage(imageUrl);
				setMessage('Image téléchargée avec succès !');
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
		if (uploadedImage && canvasRef.current) {
			const canvas = canvasRef.current;
			const ctx = canvas.getContext('2d');
			const img = new Image();

			img.onload = () => {
				canvas.width = img.width;
				canvas.height = img.height;
				ctx?.drawImage(img, 0, 0);

				// Draw triangles and angles
				ctx!.strokeStyle = 'blue';
				ctx!.lineWidth = 2;

				data.angles.forEach(({ start_point, end_point, third_point, angle }) => {
					const start = data.keypoints_positions[start_point];
					const end = data.keypoints_positions[end_point];
					const third = data.keypoints_positions[third_point];

					if (start && end && third) {
						// Draw triangle
						ctx!.beginPath();
						ctx!.fillStyle = 'rgba(255, 255, 0, 0.4)'; // Yellow triangles
						ctx!.moveTo(start[0], start[1]);
						ctx!.lineTo(end[0], end[1]);
						ctx!.lineTo(third[0], third[1]);
						ctx!.closePath();
						ctx!.fill();
						ctx!.stroke();

						// Draw angle text
						ctx!.fillStyle = '#4B0082'; // Dark purple text
						ctx!.font = '16px Arial';
						ctx!.fillText(`${Math.round(angle)}°`, end[0] + 10, end[1] - 10);
					}
				});
			};

			img.src = uploadedImage;
		}
	}, [uploadedImage]);

	return (
		<div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
			<h1>Télécharger une image</h1>
			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: '10px' }}>
					<input type='file' accept='image/*' onChange={handleFileChange} />
				</div>
				<button type='submit' disabled={loading}>
					{loading ? 'Envoi en cours...' : 'Envoyer'}
				</button>
			</form>
			{message && <p>{message}</p>}
			{uploadedImage && (
				<div style={{ marginTop: '20px', position: 'relative' }}>
					<h2>Il est en <label className='text-red-500'>{data.class_name}</label></h2>
					<h2>Voici l'image avec angles et triangles :</h2>
					<canvas ref={canvasRef} style={{ width: '640px', height: 'auto' }} />
				</div>
			)}
		</div>
	);
}
