import {
	useMutation,
	useQueryClient
} from '@tanstack/react-query'

import { Interview } from '@/core/interviews/types';

export interface UpdateInterview {
	payload: Partial<Interview>;
}

const useUpdateInterview = (id?: string) => {
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (updatedInterview: UpdateInterview) => {
			return fetch(`/api/interviews/${id}`, {
				method: 'PUT',
				body: JSON.stringify(updatedInterview.payload),
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(res => res.json());
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['interview', { id }] });
		},
	});

	return {
		...mutation
	}
};

export default useUpdateInterview;
