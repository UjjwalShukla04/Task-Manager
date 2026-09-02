import { Fragment, type ReactNode } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  initialFocus?: React.RefObject<any>;
}

const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  initialFocus,
}: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        initialFocus={initialFocus}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[3px]" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2 scale-[0.98]"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-[0.98]"
            >
              <DialogPanel
                className={`flex max-h-[calc(100vh-2rem)] w-full ${widths[size]} flex-col overflow-hidden rounded-2xl border border-line bg-elevated shadow-lg`}
              >
                <div className="flex items-start justify-between gap-4 px-6 pt-5">
                  <div>
                    <DialogTitle className="text-[15px] font-semibold text-fg">
                      {title}
                    </DialogTitle>
                    {description && (
                      <p className="mt-0.5 text-[13px] text-muted">
                        {description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="-mr-2 -mt-1 rounded-lg p-2 text-faint transition-colors hover:bg-fg/6 hover:text-fg dark:hover:bg-white/6"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                  {children}
                </div>

                {footer && (
                  <div className="border-t border-line bg-surface/50 px-6 py-3">
                    {footer}
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
