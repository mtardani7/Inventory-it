"use client";

export function AppSidebar() {
  return (
    <aside className="w-64 border-r bg-background p-4">
      <h2 className="text-xl font-bold">Inventory IT</h2>

      <nav className="mt-6 space-y-2">
        <a href="/dashboard" className="block rounded p-2 hover:bg-muted">
          Dashboard
        </a>

        <a href="/inventory" className="block rounded p-2 hover:bg-muted">
          Inventory
        </a>

        <a href="/disposal" className="block rounded p-2 hover:bg-muted">
          Disposal
        </a>

        <a href="/reports" className="block rounded p-2 hover:bg-muted">
          Reports
        </a>

        <a href="/settings" className="block rounded p-2 hover:bg-muted">
          Settings
        </a>
      </nav>
    </aside>
  );
}