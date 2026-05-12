import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Landing from "./pages/landing";
import Dashboard from "./pages/dashboard";
import NewSession from "./pages/new-session";
import Workspace from "./pages/workspace";
import Recap from "./pages/recap";
import Progress from "./pages/progress";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Analytics() {
  const [location] = useLocation();
  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("config", "G-DR50MD0S5J", { page_path: location });
    }
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/sessions" component={Dashboard} />
      <Route path="/sessions/new" component={NewSession} />
      <Route path="/sessions/:id" component={Workspace} />
      <Route path="/sessions/:id/recap" component={Recap} />
      <Route path="/progress" component={Progress} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Analytics />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
