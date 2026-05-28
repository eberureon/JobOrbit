import { toast as heroToast } from "@heroui/react";

interface ToastOptions {
	title?: React.ReactNode;
	description?: React.ReactNode;
	variant?: string;
	timeout?: number;
	onClose?: () => void;
}

function toast(options: ToastOptions) {
	const id = heroToast(options.title || "", {
		description: options.description,
		timeout: options.timeout,
		onClose: options.onClose,
	});
	return { id, dismiss: () => heroToast.close(id) };
}

function useToast() {
	return {
		toast,
		dismiss: (id?: string) => {
			if (id) heroToast.close(id);
		},
	};
}

export { useToast, toast };
