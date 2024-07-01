"use client"

import { Cross2Icon, PlusCircledIcon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { StudyStatusMap } from "@/core/studies/utils";
import { Button } from "@/frontend/components/ui/button"
import { DataTableFacetedFilter } from "@/frontend/components/ui/data-table/data-table-filter"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/frontend/components/ui/dialog"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/frontend/components/ui/select"
import { useToast } from "@/frontend/components/ui/use-toast";
import useListGroups from "@/frontend/hooks/groups/useListGroups";
import useCreateStudy from "@/frontend/hooks/studies/useCreateStudy";
import { useAnalytics } from "@/frontend/lib/analytics";

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	handleGroupChange?: (value: string) => void;
}

export function DataTableToolbar<TData>({
	table,
	handleGroupChange
}: DataTableToolbarProps<TData>) {
	const { logEvent } = useAnalytics();
	const isFiltered = table.getState().columnFilters.length > 0
	const { register, handleSubmit, reset } = useForm()
	const { mutateAsync } = useCreateStudy();
	const { data: groupData } = useListGroups();
	const [openModal, setModalOpen] = useState(false);
	const [selectedGroupForNewStudy, setSelectedGroupForNewStudy] = useState<string>();
	const { toast } = useToast();
	const router = useRouter()

	const handleCreateStudy = async (data: {[key: string]: any}) => {
		const results = await mutateAsync({
			name: data.studyName,
			organizationGroupId: selectedGroupForNewStudy
		})
		if (results.success) {
			toast({
				description: `Study "${data.studyName}" created`,
			});
			logEvent('studies_study_created', { study: data.studyName, id: results.id });
			if (results.id) {
				router.push(`/studies/${results.id}/details`);
			}
		} else {
			toast({
				description: `Study "${data.studyName}" could not be created.`,
				variant: "destructive"
			});
			logEvent('studies_study_created_failed', { study: data.studyName });
		}

		reset();
		setModalOpen(false);
	};

	const handleGroupForNewStudy = (value: string) => {
		if (value !== 'undefined') {
			setSelectedGroupForNewStudy(value);
		}
	};

	return (
		<div className="flex flex-col md:flex-row items-start md:items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				<div>
					<Select onValueChange={handleGroupChange}>
						<SelectTrigger className="w-[180px] font-medium">
							<SelectValue className="text-xs" placeholder="Select a group" />
						</SelectTrigger>
						<SelectContent className="text-xs">
							<SelectGroup className="text-xs">
								<SelectLabel className="text-xs">Select a group</SelectLabel>
								<SelectItem value="undefined">All</SelectItem>
								{groupData?.map((group) => (
									<SelectItem key={group.id} value={group.id}>
										{group.name}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<Input
					placeholder="Filter tasks..."
					value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("name")?.setFilterValue(event.target.value)
					}
					className="h-10 w-[150px] lg:w-[250px] text-xs"
				/>
				{table.getColumn("status") && (
					<DataTableFacetedFilter
						column={table.getColumn("status")}
						title="Status"
						options={StudyStatusMap}
					/>
				)}
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3"
					>
						Reset
						<Cross2Icon className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>

			<div>
				<Dialog open={openModal} onOpenChange={setModalOpen}>
					<DialogTrigger type="button" asChild>
						<Button
							variant="default"
							className=""
						>
							Create a study
							<PlusCircledIcon className="ml-2 h-4 w-4" />
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Create a new study</DialogTitle>
							<DialogDescription>
								A study is the central part of your user research, interviews, and more.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="studyName" className="text-right">
									Study name
								</Label>
								<Input 
									{...register('studyName', { required: true, minLength: 2 })} 
									id="studyName" 
									className="col-span-3" 
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="studyName" className="text-right">
									Group
								</Label>
								<Select onValueChange={handleGroupForNewStudy}>
									<SelectTrigger className="text-xs col-span-3">
										<SelectValue className="text-xs" placeholder="Select a group" />
									</SelectTrigger>
									<SelectContent className="text-xs">
										<SelectGroup className="text-xs">
											<SelectLabel className="text-xs">Select a group</SelectLabel>
											<SelectItem value="undefined">None</SelectItem>
											{groupData?.map((group) => (
												<SelectItem key={group.id} value={group.id}>
													{group.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<div className="text-xs text-right">
								Groups are a way to organize your studies. <Link href="/settings/groups" className="underline">Create one here</Link>.
							</div>
						</div>
						<DialogFooter>
							<Button onClick={handleSubmit(handleCreateStudy)}>Create study</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}