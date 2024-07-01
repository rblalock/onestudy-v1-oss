import {
	useMutation,
	useQueryClient
} from '@tanstack/react-query'

const useDeleteStudy = () => {
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (payload: {
			id: string;
		}) => {
			return fetch(`/api/studies/${payload.id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(res => res.json());
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['studies'] })
		},
	});

	return {
		...mutation
	}
};

export default useDeleteStudy;
