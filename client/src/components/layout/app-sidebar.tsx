import Link from 'next/link';
import { Folder, Home, PlusCircle } from 'lucide-react';

const links = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/items',
    label: 'Items',
    icon: Folder,
  },
  {
    href: '/items/new',
    label: 'Create Item',
    icon: PlusCircle,
  },
];

export function AppSidebar() {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">CRUD App</h1>
        <p className="text-sm text-slate-400">Fullstack project</p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
