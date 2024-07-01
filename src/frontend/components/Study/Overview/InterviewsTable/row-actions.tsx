"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"

import { Button } from "@/frontend/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu"
import Link from "next/link"
import { Interview } from "@/core/interviews/types"
import useDeleteInterview from "@/frontend/hooks/interviews/useDeleteInterview"
import { toast } from "@/frontend/components/ui/use-toast"

interface DataTableRowActionsProps<TData> {
	row: Row<Interview>;
}

export function DataTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<Interview>) {
	const { mutateAsync } = useDeleteInterview(row.original.studyId);

	const handleDeleteItem = async () => {
		if (row.original.id) {
			const results = await mutateAsync({
				id: row.original.id
			})
			if (results.success) {
				toast({
					description: `Interview deleted`,
				})
			}
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
				>
					<DotsHorizontalIcon className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[160px]">
				<Link href={`/studies/${row.original.studyId}/interview/${row.original.id}`}>
					<DropdownMenuItem>
						View
					</DropdownMenuItem>
				</Link>
				{/* <DropdownMenuItem>Favorite</DropdownMenuItem> */}
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={handleDeleteItem}>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
