import {
	useMutation,
	useQueryClient
} from '@tanstack/react-query'

const useDeleteTag = (tagId?: string) => {
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (payload: {
			id: string;
		}) => {
			return fetch(`/api/tags/${payload.id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(res => res.json());
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tags', { tagId }] })
		},
	});

	return {
		...mutation
	}
};

export default useDeleteTag;
