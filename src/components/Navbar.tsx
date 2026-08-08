import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function Navbar({
  user,
}: {
  user: { name: string; email: string };
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/boards" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-base font-bold text-white">
            T
          </span>
          <span className="text-lg font-bold text-zinc-900 dark:text-white">
            TaskFlow
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-600 sm:block dark:text-zinc-400">
            {user.name}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
