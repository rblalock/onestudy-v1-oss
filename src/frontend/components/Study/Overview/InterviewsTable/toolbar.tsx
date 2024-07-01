"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { DataTableFacetedFilter } from "@/frontend/components/ui/data-table/data-table-filter"
import { InterviewStatusMap } from "@/core/interviews/utils"
import { Interview } from "@/core/interviews/types"
import useDeleteInterview from "@/frontend/hooks/interviews/useDeleteInterview"
import { toast } from "@/frontend/components/ui/use-toast"

interface DataTableToolbarProps<TData> {
	table: Table<TData>
}

export function DataTableToolbar<TData>({
	table,
}: DataTableToolbarProps<TData>) {
	const { mutateAsync } = useDeleteInterview();
	const isFiltered = table.getState().columnFilters.length > 0;
	const selectedRows = table.getSelectedRowModel().rows;

	const handleDeleteSelectedRows = async () => {
		toast({
			description: `Deleting interviews...`,
		})

		for (const row of selectedRows) {
			const interview = row.original as Interview;
			if (interview.id) {
				await mutateAsync({ id: interview.id });
			}
		}
		window.location.reload();
	}

	return (
		<div className="flex flex-col md:flex-row items-start md:items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				<Input
					placeholder="Filter interviews..."
					value={(table.getColumn("summaryTitle")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("summaryTitle")?.setFilterValue(event.target.value)
					}
					className="h-8 w-[150px] lg:w-[250px] text-xs"
				/>
				{table.getColumn("status") && (
					<DataTableFacetedFilter
						column={table.getColumn("status")}
						title="Status"
						options={InterviewStatusMap}
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
				{selectedRows && selectedRows.length > 0 ? (
					<Button
						variant="destructive"
						onClick={handleDeleteSelectedRows}
						className="h-8 px-2 lg:px-3"
					>
						Delete {selectedRows.length} interviews
						<Cross2Icon className="ml-2 h-4 w-4" />
					</Button>
				) : null}
			</div>
		</div>
	)
}