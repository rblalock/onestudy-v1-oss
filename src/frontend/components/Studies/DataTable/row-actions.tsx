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
import { Study } from "@/core/studies/types"
import useDeleteStudy from "@/frontend/hooks/studies/useDeleteStudy"
import { toast } from "@/frontend/components/ui/use-toast"

interface DataTableRowActionsProps<TData> {
	row: Row<Study>
}

export function DataTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<Study>) {
	const { mutateAsync } = useDeleteStudy();

	const handleDeleteItem = async () => {
		if (row.original.id) {
			const results = await mutateAsync({
				id: row.original.id
			})
			if (results.success) {
				toast({
					description: `Study deleted`,
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
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[160px]">
				<Link href={`/studies/${row.original.id}`}>
					<DropdownMenuItem>
						View
					</DropdownMenuItem>
				</Link>
				<DropdownMenuItem>Favorite</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={handleDeleteItem}>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
