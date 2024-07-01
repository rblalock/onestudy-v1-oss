import {
	useMutation,
	useQueryClient
} from '@tanstack/react-query'

const useDeleteStudyInsight = (studyId?: string) => {
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: async (payload: {
			id: string;
		}) => {
			const url = `/api/insights/study/${studyId}?id=${payload.id}`;
			return fetch(url, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(res => res.json());
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['studyinsights', { studyId }] })
		},
	});

	return {
		...mutation
	}
};

export default useDeleteStudyInsight;
