export function getAuthUser() {
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { email: string; name: string };
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("auth_user");
}

export function isAuthenticated() {
  return !!getAuthUser();
}
