import { Interview } from '@/core/interviews/types';
import {
	useQuery
} from '@tanstack/react-query'

const useInterview = (id?: string) => {
	const {
		isLoading,
		error,
		isError,
		data,
		status,
		refetch
	} = useQuery({
		enabled: id ? true : false,
		queryKey: ['interview', { id }],
		queryFn: async () => {
			const url = `/api/interviews/${id}`;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(response.statusText)
			}
			const json = await response.json();

			return json?.data as Interview;
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

export default useInterview;
