import { Study } from '@/core/studies/types';
import { InsightReferencedDocuments, RAGResponse } from '@/core/vectorDocuments/types';
import {
	useQuery
} from '@tanstack/react-query'

const useListStudyInsights = (studyId?: string) => {
	const {
		isLoading,
		error,
		isError,
		data,
		status
	} = useQuery({
		queryKey: ['studyinsights', { studyId }],
		queryFn: async () => {
			if (studyId) {
				const url = `/api/insights/study/${studyId}`;
				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(response.statusText)
				}
				const json = await response.json();
				const data = json?.data as {
					studyId: string | null;
					id: string;
					organizationId: string | null;
					response: RAGResponse | null;
					question: string;
					keyQuote?: string;
					shared?: boolean;
					processing: boolean;
					referencedDocuments: InsightReferencedDocuments[] | null;
				}[]

				return data;
			} else {
				return [];
			}
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

export default useListStudyInsights;
