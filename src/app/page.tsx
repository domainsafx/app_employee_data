import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white bg-dot-grid relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-sand-50 pointer-events-none" />

      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 pt-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-navy-700 flex items-center justify-center">
            <span className="font-display text-emerald-400 font-bold text-sm">SP</span>
          </div>
          <span className="font-display font-semibold text-navy-800 text-lg">Sahayak Partners</span>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-6xl w-full mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="chip-ref inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-5">
              PARTNER & REFERRAL PLATFORM
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-navy-800 leading-tight">
              One place to manage your team and every referral they bring in
            </h1>
            <p className="mt-5 text-slate-500 text-lg max-w-md">
              Add employees, hand each of them a permanent reference ID, and watch subscriptions
              and commissions roll in — all from a clean, simple dashboard.
            </p>
          </div>

          <div className="grid gap-4">
            <Link
              href="/login"
              className="group block bg-navy-700 hover:bg-navy-800 transition-colors rounded-xl2 p-6 text-white shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-xl font-semibold">Admin / Super Admin</p>
                  <p className="text-navy-100 text-sm mt-1">Manage employees, users and platform activity</p>
                </div>
                <span className="text-emerald-400 text-2xl transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </div>
            </Link>

            <Link
              href="/employee-login"
              className="group block bg-white border border-slate-200 hover:border-emerald-300 transition-colors rounded-xl2 p-6 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-xl font-semibold text-navy-800">Employee Login</p>
                  <p className="text-slate-500 text-sm mt-1">Sign in with your mobile number &amp; OTP</p>
                </div>
                <span className="text-navy-700 text-2xl transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <footer className="relative z-10 max-w-6xl w-full mx-auto px-6 pb-8 text-xs text-slate-400">
        Sahayak Partners &middot; Internal use only
      </footer>
    </main>
  );
}
