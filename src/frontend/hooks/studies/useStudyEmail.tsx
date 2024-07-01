import { StudyEmails } from '@/core/studies/types';
import {
	useMutation,
	useQueryClient,
	useQuery
} from '@tanstack/react-query'

export interface UpdateStudyEmail {
	id: string;
	emails: string[];
}

const useUpdateStudyEmail = (id?: string) => {
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (updatedEmails: UpdateStudyEmail) => {
			return fetch(`/api/studies/emails/${updatedEmails.id}`, {
				method: 'PUT',
				body: JSON.stringify({
					emails: updatedEmails.emails
				}),
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(res => res.json());
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['study-email', { id }] });
		},
	});

	return {
		...mutation
	}
};

const useStudyEmail = (id?: string) => {
	const {
		isLoading,
		error,
		isError,
		data,
		status
	} = useQuery({
		queryKey: ['study-email', { id }],
		queryFn: async () => {
			const url = `/api/studies/emails/${id}`;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(response.statusText)
			}
			const json = await response.json();
			return json?.data as StudyEmails;
		},
	});

	return {
		isLoading,
		error,
		isError,
		data,
		status
	}
};

export {
	useUpdateStudyEmail,
	useStudyEmail,
};
