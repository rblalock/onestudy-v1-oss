import { OrganizationGroup } from '@/core/types';
import {
	useQuery
} from '@tanstack/react-query'

const useListGroups = () => {
	const {
		isLoading,
		error,
		isError,
		data,
		status
	} = useQuery({
		queryKey: ['groups'],
		queryFn: async () => {
			const response = await fetch('/api/groups')
			if (!response.ok) {
				throw new Error(response.statusText)
			}
			const json = await response.json();

			return json?.data as OrganizationGroup[];
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

export default useListGroups;
