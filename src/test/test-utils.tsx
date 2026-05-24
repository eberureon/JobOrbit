import { Toast } from "@base-ui/react/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { toastManager } from "~/hooks/use-toast";

const ToastProvider = Toast.Provider;

export function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});
	return function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				<ToastProvider toastManager={toastManager}>
					{children}
				</ToastProvider>
			</QueryClientProvider>
		);
	};
}
