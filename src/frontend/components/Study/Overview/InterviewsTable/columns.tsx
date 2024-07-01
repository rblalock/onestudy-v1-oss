import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { Checkbox } from "@/frontend/components/ui/checkbox"
import { DataTableColumnHeader } from "@/frontend/components/ui/data-table/data-table-column-header"
import { Interview, InterviewUserMetaData } from "@/core/interviews/types"

import { DataTableRowActions } from "./row-actions"
import { InterviewStatusMap } from "@/core/interviews/utils"

export const columns: ColumnDef<Interview>[] = [
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
		accessorKey: "userMetaData",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Details" />
		),
		cell: ({ row }) => {
			const val = row.getValue("userMetaData") as InterviewUserMetaData;

			return (
				<Link href={`/studies/${row.original.studyId}/interview/${row.original.id}`}>
					{val ? 
						Object.entries(val || {}).slice(0, 2).map(([key, value]) => (
							<div key={key}>
								{value}
							</div>
						))
					: (
						<>View interview</>
					)}
				</Link>
			)
		},
	},
	{
		accessorKey: "summaryTitle",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Summary" />
		),
		cell: ({ row }) => {
			return (
				<div className=" max-w-[350px] whitespace-nowrap text-ellipsis overflow-hidden">
					<Link href={`/studies/${row.original.studyId}/interview/${row.original.id}`} className="">
						{row.getValue("summaryTitle") || 'N/A'}
					</Link>
				</div>
			)
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => {
			const status = InterviewStatusMap.find(
				(status) => status.value === row.getValue("status")
			)

			return (
				<div className="flex w-[100px] items-center">
					{status?.icon ? (
						<status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
					) : null}
					<span>{status?.label || 'N/A'}</span>
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
			<DataTableColumnHeader column={column} title="Date" />
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
		id: "actions",
		cell: ({ row }) => <DataTableRowActions row={row} />,
	},
]