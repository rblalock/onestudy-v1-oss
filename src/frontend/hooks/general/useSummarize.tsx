import {
	useMutation,
} from '@tanstack/react-query'

export enum SummaryType {
	Interview = 'interview',
	Study = 'study',
	Themes = 'themes',
	Quotes = 'quotes',
}

export interface SummarizeRequest {
	id: string;
	type: SummaryType
}

const useSummarize = () => {
	const mutation = useMutation({
		mutationFn: (newSummary: SummarizeRequest) => {
			return fetch('/api/summarize', {
				method: 'POST',
				body: JSON.stringify(newSummary),
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

export default useSummarize;
