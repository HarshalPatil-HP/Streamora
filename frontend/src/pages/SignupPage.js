import { register } from "../services/authService.js";
import { showToast } from "../utils/ui.js";
import { navigate } from "../router.js";

const userPlusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>`;
const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;

export function SignupPage() {
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
            <h1 class="text-xl font-bold text-white">Create account</h1>
            <p class="mt-1 text-sm text-[#888]">Join Streamora and start creating</p>
          </div>

          <!-- Form -->
          <form id="signup-form" class="space-y-4 px-8 py-6" enctype="multipart/form-data">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-[#888]">Full Name</label>
                <input type="text" name="fullname" required
                  class="w-full rounded-xl border border-[#2E2E3A] bg-[#252530] px-4 py-2.5 text-sm text-white placeholder-[#555] outline-none transition-all focus:border-[#666] focus:ring-2 focus:ring-white/10"
                  placeholder="John Doe" autocomplete="name" />
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-[#888]">Username</label>
                <input type="text" name="uname" required
                  class="w-full rounded-xl border border-[#2E2E3A] bg-[#252530] px-4 py-2.5 text-sm text-white placeholder-[#555] outline-none transition-all focus:border-[#666] focus:ring-2 focus:ring-white/10"
                  placeholder="johndoe" autocomplete="username" />
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-[#888]">Email</label>
              <input type="email" name="email" required
                class="w-full rounded-xl border border-[#2E2E3A] bg-[#252530] px-4 py-2.5 text-sm text-white placeholder-[#555] outline-none transition-all focus:border-[#666] focus:ring-2 focus:ring-white/10"
                placeholder="you@example.com" autocomplete="email" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-[#888]">Password</label>
              <input type="password" name="password" required minlength="6"
                class="w-full rounded-xl border border-[#2E2E3A] bg-[#252530] px-4 py-2.5 text-sm text-white placeholder-[#555] outline-none transition-all focus:border-[#666] focus:ring-2 focus:ring-white/10"
                placeholder="Min. 6 characters" autocomplete="new-password" />
            </div>

            <!-- File uploads -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-[#888]">
                  Avatar <span class="text-red-400">*</span>
                </label>
                <label class="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-[#2E2E3A] bg-[#252530] p-3 text-center hover:border-[#555] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  <span class="text-[10px] text-[#666]">Upload image</span>
                  <input type="file" name="avtar" accept="image/*" required class="hidden" id="avtar-input" />
                </label>
                <p id="avtar-name" class="mt-1 truncate text-[10px] text-[#666]"></p>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-[#888]">Cover <span class="text-[#555] font-normal">(opt.)</span></label>
                <label class="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-[#2E2E3A] bg-[#252530] p-3 text-center hover:border-[#555] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  <span class="text-[10px] text-[#666]">Upload image</span>
                  <input type="file" name="coveravtar" accept="image/*" class="hidden" id="cover-input" />
                </label>
                <p id="cover-name" class="mt-1 truncate text-[10px] text-[#666]"></p>
              </div>
            </div>

            <button type="submit" id="signup-btn" class="btn-primary-dark w-full mt-2">
              Create Account
            </button>
          </form>

          <!-- Footer -->
          <div class="border-t border-[#252530] px-8 py-4 text-center">
            <p class="text-sm text-[#666]">
              Already have an account?
              <a href="#/login" class="font-semibold text-white hover:underline ml-1">Sign in</a>
            </p>
          </div>
        </div>

        <a href="#/" class="mt-6 block text-center text-xs text-[#444] hover:text-[#888] transition-colors">← Back to Home</a>
      </div>
    </div>
  `;
}

export function mountSignupPage() {
  const form = document.getElementById("signup-form");
  const btn  = document.getElementById("signup-btn");
  if (!form) return;

  // Show filename when file is selected
  document.getElementById("avtar-input")?.addEventListener("change", (e) => {
    const el = document.getElementById("avtar-name");
    if (el) el.textContent = e.target.files[0]?.name || "";
  });
  document.getElementById("cover-input")?.addEventListener("change", (e) => {
    const el = document.getElementById("cover-name");
    if (el) el.textContent = e.target.files[0]?.name || "";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    btn.disabled    = true;
    btn.textContent = "Creating account…";

    try {
      await register(fd);
      showToast("Account created! Please sign in.", "success");
      navigate("/login");
      window.location.reload();
    } catch (err) {
      showToast(err.message || "Signup failed", "error");
      btn.disabled    = false;
      btn.textContent = "Create Account";
    }
  });
}
