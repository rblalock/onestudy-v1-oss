"use client"

import { useState } from "react";

import { DataTable } from "@/frontend/components/ui/data-table/data-table";
import useListStudies from "@/frontend/hooks/studies/useListStudies";
import { useAnalytics } from "@/frontend/lib/analytics";

import { columns } from "./DataTable/columns";
import { DataTableToolbar } from "./DataTable/toolbar";

const StudiesTable = () => {
	const { logEvent } = useAnalytics();
	const [selectedGroup, setSelectedGroup] = useState<string>();
	const { data, isLoading, isError } = useListStudies(selectedGroup);

	const groupChange = (value: string) => {
		if (value === 'undefined') {
			setSelectedGroup(undefined);
		} else {
			setSelectedGroup(value);
			logEvent('studies_group_change', { group: value });
		}
	};

	return (
		<>
			<div className="w-full">
				<div className="space-y-0.5">
					<h2 className="text-2xl font-bold tracking-tight">Studies</h2>
					<p className="text-muted-foreground">
						Studies are the core of your user research, which includes interviews, summaries, and other important insight.
					</p>
				</div>

				<hr className="my-6 dark:border-slate-800" />

				{isLoading && <div>Loading...</div>}
				{isError && <div>Whoops!</div>}

				{data ? (
					<DataTable
						columns={columns}
						data={data}
						toolbar={(table) => <DataTableToolbar table={table} handleGroupChange={groupChange} />}
					/>
				) : null}
			</div>
		</>
	);
};

export default StudiesTable;
