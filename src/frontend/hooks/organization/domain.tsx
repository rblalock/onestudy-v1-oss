import {
	useMutation,
	useQuery,
	useQueryClient
} from '@tanstack/react-query'

export const useGetOrganizationDomain = () => {
	const {
		isLoading,
		error,
		isError,
		data,
		status
	} = useQuery({
		queryKey: ['organizationDomain'],
		queryFn: async () => {
			const response = await fetch('/api/organization/domain')
			if (!response.ok) {
				throw new Error(response.statusText)
			}
			const json = await response.json();

			return json?.data as string;
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

export const useUpdateOrganizationDomain = () => {
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (payload: {
			domain?: string;
		}) => {
			return fetch('/api/organization/domain', {
				method: 'PUT',
				body: JSON.stringify(payload),
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(res => {
				return res.json() as Promise<{
					success: boolean;
				}>
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['oganizationDomain'] })
		},
	});

	return {
		...mutation
	}
};
