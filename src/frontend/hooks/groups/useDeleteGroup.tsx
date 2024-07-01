import {
	useMutation,
	useQueryClient
} from '@tanstack/react-query'

const useDeleteGroup = () => {
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (payload: {
			id: string;
		}) => {
			return fetch(`/api/groups?id=${payload.id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(res => res.json());
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['groups'] })
		},
	});

	return {
		...mutation
	}
};

export default useDeleteGroup;
