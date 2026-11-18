export function useAuth() {
  return {
    isLoaded: true,
    isSignedIn: true,
    userId:
      new URLSearchParams(window.location.search).get("account") ?? "test-user",
  };
}
export function UserButton() {
  return (
    <button
      aria-label="Account menu"
      className="brand-mark"
      style={{ width: 30, height: 30, fontSize: 12 }}
    >
      T
    </button>
  );
}
