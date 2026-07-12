import { register } from "../services/authService.js";
import { showToast } from "../utils/ui.js";
import { navigate } from "../router.js";

export function SignupPage() {
  return `
    <div class="auth-page">
      <div class="glass-card w-full max-w-md p-8">
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-900">Join Streamora</h1>
          <p class="mt-2 text-sm text-slate-500">Create your creator account</p>
        </div>
        <form id="signup-form" class="space-y-4" enctype="multipart/form-data">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
            <input type="text" name="fullname" required class="input-field" placeholder="John Doe" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
            <input type="text" name="uname" required class="input-field" placeholder="johndoe" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" name="email" required class="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" name="password" required minlength="6" class="input-field" placeholder="••••••••" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Avatar</label>
            <input type="file" name="avtar" accept="image/*" required class="input-field py-2" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Cover Image (optional)</label>
            <input type="file" name="coveravtar" accept="image/*" class="input-field py-2" />
          </div>
          <button type="submit" id="signup-btn" class="btn-primary w-full">Create Account</button>
        </form>
        <p class="mt-6 text-center text-sm text-slate-500">
          Already have an account? <a href="#/login" class="font-semibold text-brand-600 hover:text-brand-700">Sign in</a>
        </p>
        <a href="#/" class="mt-4 block text-center text-sm text-slate-400 hover:text-slate-600">← Back to Home</a>
      </div>
    </div>
  `;
}

export function mountSignupPage() {
  const form = document.getElementById("signup-form");
  const btn = document.getElementById("signup-btn");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    btn.disabled = true;
    btn.textContent = "Creating account...";

    try {
      await register(fd);
      showToast("Account created! Please sign in.", "success");
      navigate("/login");
      window.location.reload();
    } catch (err) {
      showToast(err.message || "Signup failed", "error");
      btn.disabled = false;
      btn.textContent = "Create Account";
    }
  });
}
