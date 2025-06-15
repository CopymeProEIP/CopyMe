/** @format */

import { useEffect, useState } from 'react';
import { useApi } from '@/utils/api';
import { ProcessedData } from '@/constants/processedData';

const useReviews = (limit = 2) => {
	const [reviews, setReviews] = useState<ProcessedData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const api = useApi();

	const fetchReviews = async () => {
		try {
			setLoading(true);
			const response = await api.get(`/process?limit=${limit}`);
			const data = response as { data: ProcessedData[] };
			setReviews(data?.data || []);
		} catch (err) {
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchReviews();
	}, [limit]);

	return { reviews, loading, error };
};

export default useReviews;
