
import { logout } from "../lib/api.js";

export default function Sidebar() {
  return (
    <aside className="w-64 p-6 flex flex-col justify-between
      bg-gray-800 dark:bg-gray-900
      text-gray-100
      shadow-lg"
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Control Panel</h1>
        <nav className="flex flex-col gap-3">
          <a href="/" className="hover:text-gray-300 transition">Dashboard</a>
          <a href="/projects" className="hover:text-gray-300 transition">Projects</a>
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        <button
          className="bg-red-600 hover:bg-red-700 active:scale-95 shadow transition transform px-4 py-2 rounded"
          onClick={async () => {
            await logout();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

