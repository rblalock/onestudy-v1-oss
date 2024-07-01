import {
	useMutation,
	useQueryClient
} from '@tanstack/react-query'

const useCreateApiKey = () => {
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (payload: {
			name: string;
		}) => {
			return fetch('/api/apikeys', {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(res => {
				return res.json() as Promise<{
					success: boolean;
					data: {
						key: string;
						keyId: string;
					};
				}>
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['apiKeys'] })
		},
	});

	return {
		...mutation
	}
};

export default useCreateApiKey;
