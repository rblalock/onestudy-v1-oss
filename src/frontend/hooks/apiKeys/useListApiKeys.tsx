import {
	useQuery
} from '@tanstack/react-query'

import { ApiKey } from '@/core/types';

const useListApiKeys = () => {
	const {
		isLoading,
		error,
		isError,
		data,
		status
	} = useQuery({
		queryKey: ['apiKeys'],
		queryFn: async () => {
			const response = await fetch('/api/apikeys')
			if (!response.ok) {
				throw new Error(response.statusText)
			}
			const json = await response.json();

			return json?.data as ApiKey[];
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

export default useListApiKeys;
