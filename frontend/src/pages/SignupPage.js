export function SignupPage() {
  return `
    <div class="flex min-h-screen items-center justify-center bg-surface p-4">
      <div class="glass-card w-full max-w-md p-8 shadow-glow transition-all duration-300 hover:scale-[1.01]">
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" x2="19" y1="8" y2="14"/>
              <line x1="22" x2="16" y1="11" y2="11"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-50">Join Streamora</h1>
          <p class="mt-2 text-sm text-slate-400">Create your creator account</p>
        </div>

        <form class="space-y-4" id="signup-form">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">Full Name</label>
            <input type="text" class="input-field" placeholder="John Doe" disabled />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">Username</label>
            <input type="text" class="input-field" placeholder="johndoe" disabled />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
            <input type="email" class="input-field" placeholder="you@example.com" disabled />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
            <input type="password" class="input-field" placeholder="••••••••" disabled />
          </div>
          <button type="button" class="btn-primary w-full opacity-60" disabled>Create Account (Phase 2+)</button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-400">
          Already have an account?
          <a href="#/login" class="ml-1 font-medium text-accent hover:text-accent-muted">Sign in</a>
        </p>
        <a href="#/" class="mt-4 block text-center text-sm text-slate-500 transition-colors hover:text-slate-300">← Back to Home</a>
      </div>
    </div>
  `;
}
