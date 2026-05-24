import { createFileRoute } from "@tanstack/react-router";
import { ResumePage } from "../components/pages/resume";

export const Route = createFileRoute("/resume")({
	component: ResumePage,
});
