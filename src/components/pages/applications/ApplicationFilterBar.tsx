import { Filter, X } from "lucide-react";
import type { Selection } from "@heroui/react";
import {
	Button,
	Dropdown,
	Header,
	Label,
	SearchField,
	Separator,
} from "@heroui/react";
import type { ApplicationStatus } from "~/lib/types";
import { APPLICATION_STATUSES } from "~/lib/types";

interface ApplicationFilterBarProps {
	search: string;
	onSearchChange: (value: string) => void;
	statusFilter: Set<ApplicationStatus>;
	onStatusFilterChange: (filter: Set<ApplicationStatus>) => void;
	historyFilter: Set<ApplicationStatus>;
	onHistoryFilterChange: (filter: Set<ApplicationStatus>) => void;
}

export function ApplicationFilterBar({
	search,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
	historyFilter,
	onHistoryFilterChange,
}: ApplicationFilterBarProps) {
	const handleStatusSelection = (keys: Selection) => {
		onStatusFilterChange(
			new Set([...keys].map((k) => String(k) as ApplicationStatus)),
		);
	};

	const handleHistoryStatusSelection = (keys: Selection) => {
		onHistoryFilterChange(
			new Set(
				[...keys].map(
					(k) => String(k).replace(/^history-/, "") as ApplicationStatus,
				),
			),
		);
	};

	const historySelectedKeys = new Set(
		[...historyFilter].map((s) => `history-${s}`),
	);

	return (
		<>
			<div className="relative flex-1 min-w-50 w-full">
				<SearchField
					fullWidth
					name="applications-search"
					value={search}
					onChange={onSearchChange}
					onClear={() => onSearchChange("")}
					aria-label="Search applications"
				>
					<SearchField.Group className="reset-input">
						<SearchField.SearchIcon />
						<SearchField.Input
							data-testid="input-search"
							placeholder="Search company or role..."
							suppressHydrationWarning
						/>
						<SearchField.ClearButton />
					</SearchField.Group>
				</SearchField>
			</div>
			<Dropdown>
				<Button variant="outline" data-testid="button-filter-status">
					<Filter className="h-4 w-4 mr-1.5" />
					Status
					{statusFilter.size > 0 && (
						<span className="ml-2 rounded bg-primary/15 text-primary px-1.5 py-0.5 text-xs font-mono-num">
							{statusFilter.size}
						</span>
					)}
					{historyFilter.size > 0 && (
						<span className="ml-2 rounded bg-background text-muted px-1.5 py-0.5 text-xs font-mono-num">
							{historyFilter.size}
						</span>
					)}
				</Button>
				<Dropdown.Popover>
					<Dropdown.Menu aria-label="Filter status">
						<Dropdown.Section
							selectionMode="multiple"
							selectedKeys={statusFilter}
							onSelectionChange={handleStatusSelection}
						>
							<Header>Filter status</Header>
							{APPLICATION_STATUSES.map((s) => (
								<Dropdown.Item
									key={s}
									id={s}
									textValue={s}
									data-testid={`filter-status-${s}`}
								>
									<Dropdown.ItemIndicator />
									<Label>{s}</Label>
								</Dropdown.Item>
							))}
						</Dropdown.Section>
						<Separator />
						<Dropdown.Section
							selectionMode="multiple"
							selectedKeys={historySelectedKeys}
							onSelectionChange={handleHistoryStatusSelection}
						>
							<Header>Historical status</Header>
							{APPLICATION_STATUSES.map((s) => (
								<Dropdown.Item
									key={`history-${s}`}
									id={`history-${s}`}
									textValue={s}
									data-testid={`filter-history-${s}`}
								>
									<Dropdown.ItemIndicator />
									<Label>{s}</Label>
								</Dropdown.Item>
							))}
						</Dropdown.Section>
					</Dropdown.Menu>
				</Dropdown.Popover>
			</Dropdown>
			{(statusFilter.size > 0 || historyFilter.size > 0) && (
				<Button
					variant="ghost"
					size="sm"
					onPress={() => {
						onStatusFilterChange(new Set());
						onHistoryFilterChange(new Set());
					}}
					data-testid="button-clear-filters"
				>
					<X className="h-3.5 w-3.5 mr-1" />
					Clear
				</Button>
			)}
		</>
	);
}
