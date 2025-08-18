// useToast.tsx
import { useState, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";

type ToastType = "success" | "error" | "info" | "warning";
type ToastPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
  position: ToastPosition;
  duration: number;
};

const typeColors: Record<ToastType, string> = {
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  info: "bg-blue-500 text-white",
  warning: "bg-yellow-400 text-black",
};

const positionClasses: Record<ToastPosition, string> = {
  "top-left": "top-5 left-5",
  "top-right": "top-5 right-5",
  "bottom-left": "bottom-5 left-5",
  "bottom-right": "bottom-5 right-5",
};

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", position: ToastPosition = "top-right", duration = 3000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type, position, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(() => removeToast(t.id), t.duration)
    );
    return () => timers.forEach((t) => clearTimeout(t));
  }, [toasts, removeToast]);

  const ToastContainer = () => {
    return (
      <>
        {toasts.map((t) =>
          ReactDOM.createPortal(
            <div
              key={t.id}
              className={`fixed ${positionClasses[t.position]} ${typeColors[t.type]} px-4 py-2 rounded shadow-lg animate-slide-in mb-2 flex items-center justify-between min-w-[250px] z-[9999]`}
            >
              <span>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="ml-4 font-bold text-lg hover:text-gray-200"
              >
                ×
              </button>
            </div>,
            document.body
          )
        )}
      </>
    );
  };

  return { showToast, ToastContainer };
}
