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
      {/* Skip to main content — visually hidden until focused */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <aside
        className="w-full md:w-64 border-r border-border bg-white flex flex-col"
        aria-label="Sidebar"
      >
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link
            href="/"
            className="flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Second Brain — go to home page"
            data-testid="link-home"
          >
            <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
            <span className="font-semibold text-lg text-foreground tracking-tight">Second Brain</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`link-nav-${item.label.toLowerCase()}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main id="main-content" className="flex-1 overflow-auto" tabIndex={-1}>
        <div className="max-w-5xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
