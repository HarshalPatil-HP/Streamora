export function LoginPage() {
  return `
    <div class="flex min-h-screen items-center justify-center bg-surface p-4">
      <div class="glass-card w-full max-w-md p-8 shadow-glow transition-all duration-300 hover:scale-[1.01]">
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-50">Welcome back</h1>
          <p class="mt-2 text-sm text-slate-400">Sign in to your Streamora account</p>
        </div>

        <form class="space-y-4" id="login-form">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">Email or Username</label>
            <input type="text" class="input-field" placeholder="you@example.com" disabled />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
            <input type="password" class="input-field" placeholder="••••••••" disabled />
          </div>
          <button type="button" class="btn-primary w-full opacity-60" disabled>Sign In (Phase 2+)</button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-400">
          Don't have an account?
          <a href="#/signup" class="ml-1 font-medium text-accent hover:text-accent-muted">Sign up</a>
        </p>
        <a href="#/" class="mt-4 block text-center text-sm text-slate-500 transition-colors hover:text-slate-300">← Back to Home</a>
      </div>
    </div>
  `;
}
