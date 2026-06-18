import { Button, Input } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { useState } from "react";
import { unlock } from "~/lib/server/lock.functions";
import { Logo } from "./Logo";

export function LockGate({ onUnlocked }: { onUnlocked: () => void }) {
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const queryClient = useQueryClient();

	const unlockMutation = useMutation({
		mutationFn: async (pw: string) => unlock({ data: { password: pw } }),
		onSuccess: () => {
			setPassword("");
			setError("");
			queryClient.invalidateQueries({ queryKey: ["session"] });
			onUnlocked();
		},
		onError: (err: Error) => {
			setError(
				err.message === "Invalid password"
					? "Incorrect password"
					: "Something went wrong",
			);
		},
	});

	function handleSubmit(e: React.ChangeEvent) {
		e.preventDefault();
		setError("");
		unlockMutation.mutate(password);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-sm">
				<div className="mb-8 flex justify-center">
					<Logo />
				</div>
				<div className="rounded-xl border border-card-border bg-card card-hairline p-6">
					<div className="mb-6 flex flex-col items-center gap-2 text-center">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<Lock className="h-5 w-5 text-primary" />
						</div>
						<h1 className="text-lg font-semibold text-foreground">Locked</h1>
						<p className="text-sm text-muted-foreground">
							Enter your password to access JobOrbit
						</p>
					</div>
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							fullWidth
							autoFocus
						/>
						{error && <p className="text-sm text-destructive">{error}</p>}
						<Button
							type="submit"
							fullWidth
							isPending={unlockMutation.isPending}
						>
							Unlock
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
