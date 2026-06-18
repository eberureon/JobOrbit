import { AlertDialog, Button } from "@heroui/react";

export function DeleteConfirmDialog({
	open,
	onOpenChange,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	onConfirm: () => void;
}) {
	return (
		<AlertDialog.Backdrop isOpen={open} onOpenChange={onOpenChange}>
			<AlertDialog.Container>
				<AlertDialog.Dialog className="sm:max-w-100">
					<AlertDialog.Header>
						<AlertDialog.Heading>
							Disable delete confirmation?
						</AlertDialog.Heading>
					</AlertDialog.Header>
					<AlertDialog.Body>
						<p className="text-sm text-muted-foreground">
							When turned off, applications will be deleted immediately without
							asking for confirmation. Deletion cannot be undone.
						</p>
					</AlertDialog.Body>
					<AlertDialog.Footer>
						<Button variant="tertiary" onPress={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button
							variant="danger"
							onPress={() => {
								onConfirm();
								onOpenChange(false);
							}}
						>
							Disable
						</Button>
					</AlertDialog.Footer>
				</AlertDialog.Dialog>
			</AlertDialog.Container>
		</AlertDialog.Backdrop>
	);
}
