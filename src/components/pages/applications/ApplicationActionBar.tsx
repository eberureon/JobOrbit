import { Download, Plus, Upload } from "lucide-react";
import { useRef } from "react";
import { Button, Dropdown, Header, Label } from "@heroui/react";

interface ApplicationActionBarProps {
	onAddApplication: () => void;
	onExportCsv: () => void;
	onExportHistory: () => void;
	onImportCsv: (file: File) => void;
	onImportHistory: (file: File) => void;
	isImportingCsv: boolean;
	isImportingHistory: boolean;
}

export function ApplicationActionBar({
	onAddApplication,
	onExportCsv,
	onExportHistory,
	onImportCsv,
	onImportHistory,
	isImportingCsv,
	isImportingHistory,
}: ApplicationActionBarProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const historyFileInputRef = useRef<HTMLInputElement>(null);

	function handleDataAction(key: string | number) {
		switch (key) {
			case "import-csv":
				fileInputRef.current?.click();
				break;
			case "export-csv":
				onExportCsv();
				break;
			case "import-history":
				historyFileInputRef.current?.click();
				break;
			case "export-history":
				onExportHistory();
				break;
		}
	}

	function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		onImportCsv(file);
		e.target.value = "";
	}

	function handleHistoryFileImport(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		onImportHistory(file);
		e.target.value = "";
	}

	return (
		<div className="flex items-center gap-2 sm:justify-end-safe">
			<input
				ref={fileInputRef}
				type="file"
				accept=".csv"
				className="hidden"
				data-testid="input-csv-file"
				onChange={handleFileImport}
			/>
			<input
				ref={historyFileInputRef}
				type="file"
				accept=".csv"
				className="hidden"
				data-testid="input-history-csv"
				onChange={handleHistoryFileImport}
			/>
			<Dropdown>
				<Button variant="outline" data-testid="button-data-menu">
					<Download className="h-4 w-4 mr-1.5" />
					Data
				</Button>
				<Dropdown.Popover>
					<Dropdown.Menu aria-label="Data actions" onAction={handleDataAction}>
						<Dropdown.Section>
							<Header>Import / Export</Header>
							<Dropdown.Item
								id="import-csv"
								data-testid="button-import-csv"
								isDisabled={isImportingCsv}
							>
								<Upload className="h-4 w-4" />
								<Label>Import CSV</Label>
							</Dropdown.Item>
							<Dropdown.Item id="export-csv" data-testid="button-export-csv">
								<Download className="h-4 w-4" />
								<Label>Export CSV</Label>
							</Dropdown.Item>
							<Dropdown.Item
								id="import-history"
								data-testid="button-import-history"
								isDisabled={isImportingHistory}
							>
								<Upload className="h-4 w-4" />
								<Label>Import History</Label>
							</Dropdown.Item>
							<Dropdown.Item
								id="export-history"
								data-testid="button-export-history"
							>
								<Download className="h-4 w-4" />
								<Label>Export History</Label>
							</Dropdown.Item>
						</Dropdown.Section>
					</Dropdown.Menu>
				</Dropdown.Popover>
			</Dropdown>
			<Button data-testid="button-add-application" onPress={onAddApplication}>
				<Plus className="h-4 w-4 mr-1.5" />
				Add Application
			</Button>
		</div>
	);
}
