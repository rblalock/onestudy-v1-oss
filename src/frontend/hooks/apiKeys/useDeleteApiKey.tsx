import {
	useMutation,
	useQueryClient
} from '@tanstack/react-query'

const useDeleteApiKey = () => {
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (payload: {
			id: string;
		}) => {
			return fetch(`/api/apikeys?id=${payload.id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(res => res.json());
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['apiKeys'] })
		},
	});

	return {
		...mutation
	}
};

export default useDeleteApiKey;
