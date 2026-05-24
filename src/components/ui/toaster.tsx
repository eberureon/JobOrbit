import { Toast as ToastPrimitive } from "@base-ui/react/toast";

import { Toast, ToastClose, ToastDescription, ToastTitle } from "./toast";

export function Toaster() {
	const { toasts } = ToastPrimitive.useToastManager();

	return (
		<div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
			{toasts.map((t) => {
				const variant = t.type === "destructive" ? "destructive" : "default";
				return (
					<Toast
						key={t.id}
						toast={t}
						className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-open:animate-in data-closed:animate-out data-closed:fade-out-80 data-closed:slide-out-to-right-full data-open:slide-in-from-top-full data-open:sm:slide-in-from-bottom-full ${
							variant === "destructive"
								? "border-destructive bg-destructive text-destructive-foreground"
								: "border bg-background text-foreground"
						}`}
					>
						<div className="grid gap-1">
							{t.title && <ToastTitle>{t.title}</ToastTitle>}
							{t.description && (
								<ToastDescription>{t.description}</ToastDescription>
							)}
						</div>
						<ToastClose className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100" />
					</Toast>
				);
			})}
		</div>
	);
}
