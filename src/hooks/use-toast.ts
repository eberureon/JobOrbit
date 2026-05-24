import { Toast } from "@base-ui/react/toast";

export const toastManager = Toast.createToastManager();

interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  type?: string;
  variant?: string;
  timeout?: number;
  priority?: "low" | "high";
  onClose?: () => void;
  onRemove?: () => void;
}

function toast({ variant, ...props }: ToastOptions) {
  const id = toastManager.add({ ...props, type: variant || props.type });
  return {
    id,
    dismiss: () => toastManager.close(id),
    update: (updates: Partial<ToastOptions>) => toastManager.update(id, updates),
  };
}

function useToast() {
  const manager = Toast.useToastManager();

  return {
    toasts: manager.toasts,
    toast: ({ variant, ...props }: ToastOptions) => {
      const id = manager.add({ ...props, type: variant || props.type });
      return {
        id,
        dismiss: () => manager.close(id),
        update: (updates: Partial<ToastOptions>) => manager.update(id, updates),
      };
    },
    dismiss: (toastId?: string) => manager.close(toastId),
  };
}

export { useToast, toast };
