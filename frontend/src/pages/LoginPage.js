import { loginUser } from "../context/authContext.js";
import { showToast } from "../utils/ui.js";
import { navigate, getRedirectPath } from "../router.js";

export function LoginPage() {
  return `
    <div class="auth-page">
      <div class="glass-card w-full max-w-md p-8">
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p class="mt-2 text-sm text-slate-500">Sign in to your Streamora account</p>
        </div>
        <form id="login-form" class="space-y-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" name="email" required class="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" name="password" required class="input-field" placeholder="••••••••" />
          </div>
          <button type="submit" id="login-btn" class="btn-primary w-full">Sign In</button>
        </form>
        <p class="mt-6 text-center text-sm text-slate-500">
          Don't have an account? <a href="#/signup" class="font-semibold text-brand-600 hover:text-brand-700">Sign up</a>
        </p>
        <a href="#/" class="mt-4 block text-center text-sm text-slate-400 hover:text-slate-600">← Back to Home</a>
      </div>
    </div>
  `;
}

export function mountLoginPage() {
  const form = document.getElementById("login-form");
  const btn = document.getElementById("login-btn");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = fd.get("email")?.toString().trim();
    const password = fd.get("password")?.toString();

    btn.disabled = true;
    btn.textContent = "Signing in...";

    try {
      await loginUser(email, password);
      showToast("Welcome back!", "success");
      navigate(getRedirectPath() || "/");
      window.location.reload();
    } catch (err) {
      showToast(err.message || "Login failed", "error");
      btn.disabled = false;
      btn.textContent = "Sign In";
    }
  });
}
