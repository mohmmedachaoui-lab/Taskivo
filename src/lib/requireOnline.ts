export function requireOnline(): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    alert("You're offline. Please check your connection and try again.");
    return false;
  }
  return true;
}
