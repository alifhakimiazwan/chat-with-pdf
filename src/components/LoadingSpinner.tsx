import { Loader2 } from "lucide-react";

export default function LoadingSpinner({
  message = "Generating flashcards...",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 text-blue-600 text-sm font-medium animate-pulse mt-4">
      <Loader2 className="animate-spin w-4 h-4" />
      <span>{message}</span>
    </div>
  );
}
