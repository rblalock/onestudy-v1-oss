import { XCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/frontend/components/ui/button"
import { Card, CardContent,CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Input } from "@/frontend/components/ui/input"
import { useToast } from "@/frontend/components/ui/use-toast";
import useCreateGroup from "@/frontend/hooks/groups/useCreateGroup";
import useDeleteGroup from "@/frontend/hooks/groups/useDeleteGroup";
import useListGroups from "@/frontend/hooks/groups/useListGroups";

const GroupsPage = () => {
	const { register, handleSubmit, reset } = useForm()
	const { toast } = useToast()
	const { data, isLoading, isError } = useListGroups();
	const { mutateAsync } = useCreateGroup();
	const { mutateAsync: deleteGroup } = useDeleteGroup();

	const handleCreateGroup = async (data: { [key: string]: any }) => {
		const results = await mutateAsync({
			name: data.groupName
		})
		if (results.success) {
			toast({
				description: `Group "${data.groupName}" created`,
			})
		} else {
			toast({
				description: `Group "${data.groupName}" could not be created.`,
				variant: "destructive"
			})
		}

		reset({ groupName: "" });
	};

	const handleDeleteGroup = async (id: string) => {
		const results = await deleteGroup({ id });
		if (results.success) {
			toast({
				description: `Group deleted`,
			})
		} else {
			toast({
				description: `Group could not be deleted.`,
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
							<CardTitle>Create a group</CardTitle>
							<CardDescription>
								Organization groups help you organize things within the app such as studies grouped by a department.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Input
								{...register('groupName', { required: true, minLength: 2 })}
								id="groupName"
								className="mb-2"
							/>
							<Button
								className=""
								onClick={handleSubmit(handleCreateGroup)}
							>
								Create group
							</Button>
						</CardContent>
					</Card>
				</div>

				<div className="w-full md:w-1/2 mx-5">
					<h2 className="text-2xl mb-3">Existing groups</h2>

					{isLoading && <div>Loading...</div>}
					{isError && <div>Whoops!</div>}

					{(data && data.length > 0) ? data.map((group, index) => (
						<div key={index} className="flex items-center justify-between py-2 space-x-2 bordr border-b dark:border-gray-800 space-y-2">
							<span>{group.name}</span>
							<button onClick={() => handleDeleteGroup(group.id)}>
								<XCircleIcon className="h-5 w-5" />
							</button>
						</div>
					)) : (
						<div>No groups have been created.</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default GroupsPage;

