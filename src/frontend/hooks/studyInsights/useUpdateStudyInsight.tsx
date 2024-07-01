import {
	useMutation,
	useQueryClient
} from '@tanstack/react-query'

import { StudyInsight } from '@/core/studies/types';

export interface UpdateStudyInsight {
	payload: Partial<StudyInsight>;
}

const useUpdateStudyInsight = (studyId?: string, studyInsightId?: string) => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async (updatedStudyInsight: UpdateStudyInsight) => {
			return fetch(`/api/insights/study/${studyId}?id=${updatedStudyInsight.payload.id}`, {
				method: 'PUT',
				body: JSON.stringify(updatedStudyInsight.payload),
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(res => res.json());
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['studyInsight', { studyInsightId }] })
		},
	});

	return {
		...mutation
	}
};

export default useUpdateStudyInsight;
