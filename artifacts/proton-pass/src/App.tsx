import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import VaultPage from "@/pages/VaultPage";
import GeneratorPage from "@/pages/GeneratorPage";
import SecurityPage from "@/pages/SecurityPage";
import TrashPage from "@/pages/TrashPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/vault" component={VaultPage} />
        <Route path="/vault/:vaultId" component={VaultPage} />
        <Route path="/generator" component={GeneratorPage} />
        <Route path="/security" component={SecurityPage} />
        <Route path="/trash" component={TrashPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
