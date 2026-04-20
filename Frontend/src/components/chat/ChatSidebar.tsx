import { Link } from "@tanstack/react-router";
import { Activity, Plus, MessageSquare, Settings, LogOut } from "lucide-react";

interface ChatThread {
  id: string;
  title: string;
  ts: string;
}

const mockThreads: ChatThread[] = [
  { id: "1", title: "Red patch on forearm", ts: "Today" },
  { id: "2", title: "Itchy scalp evaluation", ts: "Yesterday" },
  { id: "3", title: "Mole change check", ts: "3 days ago" },
];

export function ChatSidebar({ onNew }: { onNew: () => void }) {
  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-cyan to-bio">
            <Activity className="h-3.5 w-3.5 text-background" strokeWidth={3} />
          </div>
          <span className="font-display text-sm font-semibold">
            NeuroSkin<span className="text-gradient-brand">.AI</span>
          </span>
        </Link>
      </div>

      <div className="px-3">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-bio px-3 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          New analysis
        </button>
      </div>

      <div className="mt-6 flex-1 overflow-y-auto px-3">
        <p className="px-2 pb-2 text-xs uppercase tracking-wider text-muted-foreground/70">
          History
        </p>
        <div className="space-y-1">
          {mockThreads.map((t) => (
            <button
              key={t.id}
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate">{t.title}</div>
                <div className="text-xs text-muted-foreground/60">{t.ts}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet to-cyan font-medium text-background">
            U
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">Guest user</div>
            <div className="truncate text-xs text-muted-foreground">demo session</div>
          </div>
          <button className="text-muted-foreground transition-colors hover:text-foreground">
            <Settings className="h-4 w-4" />
          </button>
        </div>
        <Link
          to="/login"
          className="mt-1 flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </Link>
      </div>
    </aside>
  );
}
