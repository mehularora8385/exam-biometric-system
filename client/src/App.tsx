import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider, useAppStore } from "@/lib/store";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import ExamActions from "@/pages/exam-actions";
import RoundOne from "@/pages/round-one";
import RoundTwo from "@/pages/round-two";
import SyncPage from "@/pages/sync";
import Layout from "@/components/layout";
import NotFound from "@/pages/not-found";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { state } = useAppStore();
  const [, setLocation] = useLocation();

  if (!state.operator) {
    // Redirect happens in render to avoid effect issues during render phase, 
    // but wouter usually handles this better with effects. 
    // For now simple return null + effect
    setTimeout(() => setLocation("/login"), 0);
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        <Layout>
          <ProtectedRoute component={Dashboard} />
        </Layout>
      </Route>

      <Route path="/exam-actions">
        <Layout>
          <ProtectedRoute component={ExamActions} />
        </Layout>
      </Route>

      <Route path="/round-one">
        <Layout>
          <ProtectedRoute component={RoundOne} />
        </Layout>
      </Route>

      <Route path="/round-two">
        <Layout>
          <ProtectedRoute component={RoundTwo} />
        </Layout>
      </Route>

      <Route path="/sync">
        <Layout>
          <ProtectedRoute component={SyncPage} />
        </Layout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router />
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
