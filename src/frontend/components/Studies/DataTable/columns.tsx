import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { Study } from "@/core/studies/types"
import { StudyStatusMap } from "@/core/studies/utils"
import { Checkbox } from "@/frontend/components/ui/checkbox"
import { DataTableColumnHeader } from "@/frontend/components/ui/data-table/data-table-column-header"

import { DataTableRowActions } from "./row-actions"

export const columns: ColumnDef<Study>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
				className="translate-y-[2px]"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
				className="translate-y-[2px]"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
		cell: ({ row }) => {
			return (
				<Link href={`/studies/${row.original.id}`}>
					{row.getValue("name")}
				</Link>
			)
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => {
			const status = StudyStatusMap.find(
				(status) => status.value === row.getValue("status")
			)

			if (!status) {
				return null
			}

			return (
				<div className="flex items-center">
					{status.icon && (
						<status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
					)}
					<span>{status.label}</span>
				</div>
			)
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id))
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Created At" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex items-center">
					<span>
						{new Date(row.getValue("createdAt")).toLocaleDateString('en-US')}
					</span>
				</div>
			)
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id))
		},
	},
	{
		accessorKey: "interviewCount",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Completed Interviews" />
		),
		cell: ({ row }) => {
			return (
				<div className="flex items-center">
					<span>
						{row.getValue("interviewCount")}
					</span>
				</div>
			)
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id))
		},
	},
	{
		id: "actions",
		cell: ({ row }) => <DataTableRowActions row={row} />,
	},
]