import { XCircleIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { useToast } from "@/frontend/components/ui/use-toast";
import useCreateTag from "@/frontend/hooks/tags/useCreateTag";
import useDeleteTag from "@/frontend/hooks/tags/useDeleteTag";
import useTagsList from "@/frontend/hooks/tags/useTagsList";

import TagSelector from "../Fields/TagSelector";

const TagsPage = () => {
	const { toast } = useToast()
	const { data, isLoading, isError, refetch } = useTagsList();
	const { mutateAsync: mutateDeleteTag } = useDeleteTag();
	const { mutateAsync: mutateTag, isLoading: tagIsCreating } = useCreateTag();

	const handleCreateTag = async (data: {
		tag: string;
		color: string;
	}) => {
		const results = await mutateTag({
			tagName: data.tag,
			color: data.color,
		})
		if (results.success) {
			toast({
				description: `Tag "${data.tag}" created`,
			});
			refetch();
		} else {
			toast({
				description: `Tag "${data.tag}" could not be created.`,
				variant: "destructive"
			})
		}
	};

	const handleDeleteTag = async (id?: string) => {
		if (!id) return;

		const results = await mutateDeleteTag({ id });
		if (results.success) {
			toast({
				description: `Tag deleted`,
			})
		} else {
			toast({
				description: `Tag could not be deleted.`,
				variant: "destructive"
			})
		}
	};

	return (
		<div>
			<div className="">
				<div className="mb-10 w-full md:w-2/3">
					<Card>
						<CardHeader>
							<CardTitle>Create a tag</CardTitle>
							<CardDescription>
								Tags are used to highlight and theme interview transcripts. 
								<br />In the qualitative world they're called "codes" or "labels."
							</CardDescription>
						</CardHeader>
						<CardContent>
							<TagSelector onTagSelection={handleCreateTag} />
						</CardContent>
					</Card>
				</div>

				<div className="w-full md:w-1/2 mx-5">
					<h2 className="text-2xl mb-3">Existing tags</h2>

					{isLoading && <div>Loading...</div>}
					{isError && <div>Whoops!</div>}

					{(data && data.length > 0) ? data.map((tag, index) => (
						<div key={index} className="flex items-center justify-between py-2 space-x-2 bordr border-b dark:border-gray-800 space-y-2">
							<div>
								<span
									className={`animate-fade px-1 py-0.2 rounded-full mr-2`}
									style={{
										backgroundColor: tag.color,
									}}
								/>
								<span>{tag.tagName}</span>
							</div>
							<button onClick={() => handleDeleteTag(tag.id)}>
								<XCircleIcon className="h-5 w-5" />
							</button>
						</div>
					)) : (
						<div>No tags have been created.</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default TagsPage;

