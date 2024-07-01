import {
	useMutation,
	useQueryClient
} from '@tanstack/react-query'

export interface NewGroup {
	name: string;
}

const useCreateGroup = () => {
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (payload: NewGroup) => {
			return fetch('/api/groups', {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					'Content-Type': 'application/json'
				},
			}).then(res => res.json());
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['groups'] })
		},
	});

	return {
		...mutation
	}
};

export default useCreateGroup;
