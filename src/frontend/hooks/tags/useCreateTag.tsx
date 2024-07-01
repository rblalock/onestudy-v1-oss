import {
	useMutation,
} from '@tanstack/react-query'

import { Tag } from '@/core/tags/types';

export interface NewTag {
	studyId?: string;
	color: string;
	tagName: string;
}

const useCreateTag = () => {
	const mutation = useMutation({
		mutationFn: (newTag: NewTag) => {
			return fetch('/api/tags', {
				method: 'POST',
				body: JSON.stringify(newTag),
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(async (res) => {
				const data = await res.json();
				return data as {
					success: boolean;
					id: string;
				}
			});
		},
	});

	return {
		...mutation
	}
};

export default useCreateTag;
