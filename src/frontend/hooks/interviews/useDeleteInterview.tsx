import {
	useMutation,
	useQueryClient
} from '@tanstack/react-query'

const useDeleteInterview = (studyId?: string) => {
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (payload: {
			id: string;
		}) => {
			return fetch(`/api/interviews/${payload.id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(res => res.json());
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['interviews', { studyId }] })
		},
	});

	return {
		...mutation
	}
};

export default useDeleteInterview;
