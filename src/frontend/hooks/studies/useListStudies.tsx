import {
	useQuery
} from '@tanstack/react-query'

import { Study } from '@/core/studies/types';

const useListStudies = (groupdId?: string) => {
	const {
		isLoading,
		error,
		isError,
		data,
		status
	} = useQuery({
		queryKey: ['studies', { groupdId }],
		queryFn: async () => {
			let url;
			if (groupdId) {
				url = `/api/studies?groupId=${groupdId}`
			} else {
				url = `/api/studies`
			}
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(response.statusText)
			}
			const json = await response.json();

			return json?.data as Study[];
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

export default useListStudies;
