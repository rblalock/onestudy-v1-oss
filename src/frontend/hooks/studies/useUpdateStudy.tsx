import {
	useMutation,
	useQueryClient
} from '@tanstack/react-query'

import { Study } from '@/core/studies/types';

export interface UpdateStudy {
	payload: Partial<Study>;
}

const useUpdateStudy = (id?: string) => {
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (updatedStudy: UpdateStudy) => {
			return fetch(`/api/studies/${id}`, {
				method: 'PUT',
				body: JSON.stringify(updatedStudy.payload),
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(res => res.json());
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['study', { id }] })
		},
	});

	return {
		...mutation
	}
};

export default useUpdateStudy;
