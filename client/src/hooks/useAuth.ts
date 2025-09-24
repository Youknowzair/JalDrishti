// Deprecated hook; use the context-based auth from `contexts/AuthContext.ts` instead.
// Kept to prevent import breakages where it's referenced indirectly.
export function useAuth() {
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  } as const;
}
