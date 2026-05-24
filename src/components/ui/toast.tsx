import { Toast as ToastPrimitive } from "@base-ui/react/toast";

import { cn } from "~/lib/utils";

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = ToastPrimitive.Viewport;

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
	return (
		<ToastPrimitive.Root
			data-slot="toast"
			className={cn(className)}
			{...props}
		/>
	);
}

function ToastAction({ className, ...props }: ToastPrimitive.Action.Props) {
	return (
		<ToastPrimitive.Action
			data-slot="toast-action"
			className={cn(className)}
			{...props}
		/>
	);
}

function ToastClose({ className, ...props }: ToastPrimitive.Close.Props) {
	return (
		<ToastPrimitive.Close
			data-slot="toast-close"
			className={cn(className)}
			{...props}
		/>
	);
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
	return (
		<ToastPrimitive.Title
			data-slot="toast-title"
			className={cn("text-sm font-semibold", className)}
			{...props}
		/>
	);
}

function ToastDescription({
	className,
	...props
}: ToastPrimitive.Description.Props) {
	return (
		<ToastPrimitive.Description
			data-slot="toast-description"
			className={cn("text-sm opacity-90", className)}
			{...props}
		/>
	);
}

type ToastProps = ToastPrimitive.Root.Props;
type ToastActionElement = React.ReactElement<typeof ToastPrimitive.Action>;

export {
	type ToastProps,
	type ToastActionElement,
	ToastProvider,
	ToastViewport,
	Toast,
	ToastTitle,
	ToastDescription,
	ToastClose,
	ToastAction,
};
