// Temporary helper to get userId from localStorage
// This is a workaround until session cookies are fixed properly

export function getUserIdFromLocalStorage(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("userId")
}

export function setUserIdInLocalStorage(userId: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("userId", userId)
}

export function clearUserIdFromLocalStorage(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("userId")
}
