import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    disabled?: boolean;
}

export default function Modal({ open, onOpenChange, title, description, children, disabled = false }: ModalProps) {
    return (
        <Dialog.Root open={open} onOpenChange={disabled ? undefined : onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content
                    className={cn(
                        'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-gray-900 border border-gray-800 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg'
                    )}
                    onEscapeKeyDown={disabled ? (e) => e.preventDefault() : undefined}
                    onPointerDownOutside={disabled ? (e) => e.preventDefault() : undefined}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <Dialog.Title className="text-lg font-semibold text-white">
                                {title}
                            </Dialog.Title>
                            {description && (
                                <Dialog.Description className="text-sm text-gray-400 mt-1">
                                    {description}
                                </Dialog.Description>
                            )}
                        </div>
                        <Dialog.Close
                            disabled={disabled}
                            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 data-[state=open]:bg-gray-800"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                            <span className="sr-only">Close</span>
                        </Dialog.Close>
                    </div>
                    <div className="mt-4">{children}</div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
