/**
 * Auth context placeholder — will manage user session state in a future phase.
 */
const state = {
  user: null,
  isAuthenticated: false,
};

export function getAuthState() {
  return { ...state };
}

export function setAuthUser(user) {
  state.user = user;
  state.isAuthenticated = Boolean(user);
}

export function clearAuth() {
  state.user = null;
  state.isAuthenticated = false;
}
