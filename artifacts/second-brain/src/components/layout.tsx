import React from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, BarChart3, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/sessions", label: "Sessions", icon: LayoutDashboard },
    { href: "/progress", label: "Progress", icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-[100dvh] w-full flex-col md:flex-row bg-[#F9FAFB]">
      <aside className="w-full md:w-64 border-r border-border bg-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-semibold text-lg text-foreground tracking-tight">Second Brain</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`link-nav-${item.label.toLowerCase()}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.startsWith(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
