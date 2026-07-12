import { loginUser } from "../context/authContext.js";
import { showToast } from "../utils/ui.js";
import { navigate, getRedirectPath } from "../router.js";

const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;

export function LoginPage() {
  return `
    <div class="auth-page">
      <!-- Subtle background pattern -->
      <div class="pointer-events-none absolute inset-0 opacity-[0.025]"
        style="background-image: linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px); background-size: 48px 48px;">
      </div>

      <div class="relative w-full max-w-sm">
        <!-- Logo -->
        <div class="mb-8 text-center">
          <a href="#/" class="inline-flex items-center gap-3 select-none">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0A0A0A]">
              ${playIcon}
            </div>
            <span class="text-xl font-bold tracking-tight text-white">Streamora</span>
          </a>
        </div>

        <!-- Card -->
        <div class="overflow-hidden rounded-2xl border border-[#2A2A35] bg-[#1C1C22] shadow-card">
          <!-- Card header -->
          <div class="border-b border-[#252530] px-8 py-6">
            <h1 class="text-xl font-bold text-white">Welcome back</h1>
            <p class="mt-1 text-sm text-[#888]">Sign in to continue to Streamora</p>
          </div>

          <!-- Form -->
          <form id="login-form" class="space-y-4 px-8 py-6">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-[#888]">Email</label>
              <input type="email" name="email" required
                class="w-full rounded-xl border border-[#2E2E3A] bg-[#252530] px-4 py-2.5 text-sm text-white placeholder-[#555] outline-none transition-all focus:border-[#666] focus:ring-2 focus:ring-white/10"
                placeholder="you@example.com" autocomplete="email" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-[#888]">Password</label>
              <input type="password" name="password" required
                class="w-full rounded-xl border border-[#2E2E3A] bg-[#252530] px-4 py-2.5 text-sm text-white placeholder-[#555] outline-none transition-all focus:border-[#666] focus:ring-2 focus:ring-white/10"
                placeholder="Enter your password" autocomplete="current-password" />
            </div>
            <button type="submit" id="login-btn" class="btn-primary-dark w-full mt-2">
              Sign In
            </button>
          </form>

          <!-- Footer -->
          <div class="border-t border-[#252530] px-8 py-4 text-center">
            <p class="text-sm text-[#666]">
              Don't have an account?
              <a href="#/signup" class="font-semibold text-white hover:underline ml-1">Sign up</a>
            </p>
          </div>
        </div>

        <a href="#/" class="mt-6 block text-center text-xs text-[#444] hover:text-[#888] transition-colors">← Back to Home</a>
      </div>
    </div>
  `;
}

export function mountLoginPage() {
  const form = document.getElementById("login-form");
  const btn  = document.getElementById("login-btn");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd       = new FormData(form);
    const email    = fd.get("email")?.toString().trim();
    const password = fd.get("password")?.toString();

    btn.disabled    = true;
    btn.textContent = "Signing in…";

    try {
      await loginUser(email, password);
      showToast("Welcome back!", "success");
      navigate(getRedirectPath() || "/");
      window.location.reload();
    } catch (err) {
      showToast(err.message || "Login failed", "error");
      btn.disabled    = false;
      btn.textContent = "Sign In";
    }
  });
}
