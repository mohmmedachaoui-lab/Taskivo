import { showToast } from "@/components/ui/Toast";

export function requireOnline(): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    showToast("You're offline. Please check your connection.", "warning");
    return false;
  }
  return true;
}
