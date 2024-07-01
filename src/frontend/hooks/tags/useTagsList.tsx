import {
	useQuery
} from '@tanstack/react-query'

import { Tag } from '@/core/tags/types';

const useTagsList = (studyId?: string) => {
	const {
		isLoading,
		error,
		isError,
		data,
		status,
		refetch
	} = useQuery({
		queryKey: ['tags', { studyId }],
		queryFn: async () => {
			let url;
			if (studyId) {
				url = `/api/tags?studyId=${studyId}`
			} else {
				url = `/api/tags`
			}
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(response.statusText)
			}
			const json = await response.json();

			return json?.data as Tag[];
		},
	});

	return {
		isLoading,
		error,
		isError,
		data,
		status,
		refetch
	}
};

export default useTagsList;
