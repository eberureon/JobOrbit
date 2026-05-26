import { Toast } from "@base-ui/react/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";
import { toastManager } from "~/hooks/use-toast";
import { SettingsProvider } from "~/lib/use-settings";

const ToastProvider = Toast.Provider;

export function createWrapper() {
		return function Wrapper({ children }: { children: ReactNode }) {
			const [queryClient] = useState(
				() =>
					new QueryClient({
						defaultOptions: {
							queries: { retry: false },
						},
					}),
			);
			return (
			<QueryClientProvider client={queryClient}>
				<SettingsProvider>
					<ToastProvider toastManager={toastManager}>{children}</ToastProvider>
				</SettingsProvider>
			</QueryClientProvider>
		);
	};
}
