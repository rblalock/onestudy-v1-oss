import {
	useMutation,
} from '@tanstack/react-query'

import { Tag } from '@/core/tags/types';

interface Args {
	interviewId: string;
	studyId: string;
}

const useCreateInterviewTags = () => {
	const mutation = useMutation({
		mutationFn: (args: Args) => {
			return fetch(`/api/tags/interview/${args.interviewId}?studyId=${args.studyId}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(async (res) => {
				const data = await res.json();
				return data as {
					success: boolean;
				}
			});
		},
	});

	return {
		...mutation
	}
};

export default useCreateInterviewTags;
