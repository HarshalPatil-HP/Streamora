import * as authService from "../services/authService.js";

const state = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn(getAuthState()));
}

export function getAuthState() {
  return { ...state };
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setAuthUser(user) {
  state.user = user;
  state.isAuthenticated = Boolean(user);
  state.isLoading = false;
  notify();
}

export function clearAuth() {
  state.user = null;
  state.isAuthenticated = false;
  state.isLoading = false;
  notify();
}

export function setAuthLoading(loading) {
  state.isLoading = loading;
  notify();
}

export async function initAuth() {
  setAuthLoading(true);
  try {
    const user = await authService.getProfile();
    setAuthUser(user);
  } catch {
    clearAuth();
  }
}

export async function loginUser(email, password) {
  const result = await authService.login(email, password);
  setAuthUser(result.user);
  return result;
}

export async function logoutUser() {
  try {
    await authService.logout();
  } finally {
    clearAuth();
  }
}

export function requireAuth(redirectPath) {
  if (state.isAuthenticated) return true;
  const redirect = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : "";
  window.location.hash = `#/login${redirect}`;
  return false;
}
