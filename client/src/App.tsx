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
import CentreDashboard from "@/pages/centre-dashboard";
import ExamDashboard from "@/pages/exam-dashboard";
import AdminPanel from "@/pages/admin-panel";
import AdminLogin from "@/pages/login";
import ClientDashboard from "@/pages/client-dashboard";
import Layout from "@/components/layout";
import NotFound from "@/pages/not-found";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { state } = useAppStore();
  const [, setLocation] = useLocation();

  if (!state.operator) {
    setTimeout(() => setLocation("/login"), 0);
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/admin/login" component={AdminLogin} />
      
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

      <Route path="/centre-dashboard">
        <Layout>
          <ProtectedRoute component={CentreDashboard} />
        </Layout>
      </Route>

      <Route path="/exam-dashboard">
        <Layout>
          <ProtectedRoute component={ExamDashboard} />
        </Layout>
      </Route>

      <Route path="/admin-panel">
        <Layout>
          <ProtectedRoute component={AdminPanel} />
        </Layout>
      </Route>

      <Route path="/client-dashboard">
        <ClientDashboard />
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
