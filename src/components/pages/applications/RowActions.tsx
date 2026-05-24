import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";

type RowActionsProps = {
	id: number;
	jobUrl: string | null;
	onEdit: () => void;
	onDelete: () => void;
};

export function RowActions({ id, jobUrl, onEdit, onDelete }: RowActionsProps) {
	return (
		<div className="inline-flex items-center gap-1">
			{jobUrl && (
				<a
					href={jobUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="p-1.5 rounded hover-elevate text-muted-foreground hover:text-foreground"
					data-testid={`link-job-${id}`}
					aria-label="Open job link"
				>
					<ExternalLink className="h-3.5 w-3.5" />
				</a>
			)}
			<Button
				variant="ghost"
				size="icon"
				onClick={onEdit}
				className="p-1.5 rounded hover-elevate text-muted-foreground hover:text-foreground"
				data-testid={`button-edit-${id}`}
				aria-label="Edit"
			>
				<Pencil className="h-3.5 w-3.5" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={onDelete}
				className="p-1.5 rounded hover-elevate text-muted-foreground hover:text-destructive"
				data-testid={`button-delete-${id}`}
				aria-label="Delete"
			>
				<Trash2 className="h-3.5 w-3.5" />
			</Button>
		</div>
	);
}
