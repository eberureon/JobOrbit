import { createFileRoute } from "@tanstack/react-router";
import { ApplicationsPage } from "~/components/pages/applications";

export const Route = createFileRoute("/applications")({
	component: ApplicationsPage,
});
