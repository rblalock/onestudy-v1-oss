import { Study } from '@/core/studies/types';
import {
	useQuery
} from '@tanstack/react-query'

const useStudy = (id?: string) => {
	const {
		isLoading,
		error,
		isError,
		data,
		status
	} = useQuery({
		enabled: id ? true : false,
		queryKey: ['study', { id }],
		queryFn: async () => {
			const url = `/api/studies/${id}`;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(response.statusText)
			}
			const json = await response.json();

			return json?.data as Study;
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

export default useStudy;
