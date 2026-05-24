import { Toast } from "@base-ui/react/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { toastManager } from "~/hooks/use-toast";
import { SettingsProvider } from "~/lib/use-settings";

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
				<SettingsProvider>
					<ToastProvider toastManager={toastManager}>
						{children}
					</ToastProvider>
				</SettingsProvider>
			</QueryClientProvider>
		);
	};
}
