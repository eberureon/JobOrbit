import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
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
		<Button
			variant="ghost"
			fullWidth
			size="sm"
			isIconOnly={collapsed}
			onPress={() => lockMutation.mutate()}
			className={`group text-sidebar-foreground/65 hover:text-lagoon-deep ${collapsed ? "" : "justify-start gap-2.5 px-3"}`}
			aria-label="Lock Page"
		>
			<LockKeyhole className="h-4 w-4 shrink-0" />
			{!collapsed && (
				<span className="transition-opacity duration-200 inline-block">
					Lock Page
				</span>
			)}
		</Button>
	);
}
