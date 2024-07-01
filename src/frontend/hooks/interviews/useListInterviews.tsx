import { Interview } from '@/core/interviews/types';

import {
	useQuery
} from '@tanstack/react-query'

const useListInterviews = (studyId?: string) => {
	const {
		isLoading,
		error,
		isError,
		data,
		status
	} = useQuery({
		queryKey: ['interviews', { studyId }],
		enabled: !!studyId,
		queryFn: async () => {
			const url = `/api/interviews?studyId=${studyId}`;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(response.statusText)
			}
			const json = await response.json();

			return json?.data as Interview[];
		},
	});

	return {
		isLoading,
		error,
		isError,
		data,
		status
	}
};

export default useListInterviews;
