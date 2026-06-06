import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LockKeyhole } from "lucide-react";
import { checkSession, getLock, lockApp } from "~/lib/server/lock.functions";

export function LockToggle({
	collapsed,
	onLocked,
}: {
	collapsed?: boolean;
	onLocked?: () => void;
}) {
	const queryClient = useQueryClient();
	const { data: lock } = useQuery({
		queryKey: ["lock"],
		queryFn: () => getLock(),
	});
	const { data: session } = useQuery({
		queryKey: ["session"],
		queryFn: () => checkSession(),
	});

	const lockMutation = useMutation({
		mutationFn: () => lockApp(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["lock"] });
			onLocked?.();
		},
	});

	if (lock === undefined) return null;
	if (!lock.enabled) return null;
	if (session?.authenticated === undefined) return null;
	if (!session.authenticated) return null;

	return (
		<button
			type="button"
			onClick={() => lockMutation.mutate()}
			className={`group relative flex items-center rounded-md py-2 text-sm font-medium transition-colors ${
				collapsed ? "justify-center" : "gap-3 px-3"
			} text-muted-foreground hover:text-foreground w-full`}
			title={collapsed ? "Lock" : "Lock"}
			aria-label="Lock"
		>
			<LockKeyhole className="h-4 w-4 shrink-0 text-muted-foreground" />
			<span
				className={`transition-opacity duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden inline-block whitespace-nowrap" : ""}`}
			>
				Lock
			</span>
		</button>
	);
}
