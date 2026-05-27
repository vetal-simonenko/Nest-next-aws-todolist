export function AppHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
      <div>
        <p className="text-sm text-slate-400">Welcome back</p>
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>

      <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
        Logout
      </button>
    </header>
  );
}
