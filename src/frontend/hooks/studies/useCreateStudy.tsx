import {
	useMutation
} from '@tanstack/react-query'

export interface NewStudy {
	name: string;
	organizationGroupId?: string;
}

const useCreateStudy = () => {
	// const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (newStudy: NewStudy) => {
			return fetch('/api/studies', {
				method: 'POST',
				body: JSON.stringify(newStudy),
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(res => res.json());
		},
		// onSuccess: () => {
		// 	queryClient.invalidateQueries({ queryKey: ['studies'] })
		// },
	});

	return {
		...mutation
	}
};

export default useCreateStudy;
