import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import AgentLayout from "./components/AgentLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Agents from "./pages/Agents";
import Briefings from "./pages/Briefings";
import Credits from "./pages/Credits";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Teams from "./pages/Teams";
import BriefingDetail from "./pages/BriefingDetail";
import Login from "./pages/Login";
import Users from "./pages/Users";
import AutomatedBriefings from "./pages/AutomatedBriefings";
import VerifyEmail from "./pages/VerifyEmail";
import AdminSettings from "./pages/AdminSettings";

function Router() {
  return (
    <Switch>
      {/* Public routes without layout */}
      <Route path={"/login"} component={Login} />
      <Route path={"/verify-email"} component={VerifyEmail} />
      
      {/* Protected routes with layout */}
      <Route>
        <AgentLayout>
          <Switch>
            <Route path={"/"} component={Home} />
            <Route path={"/agents"} component={Agents} />
            <Route path={"/briefings"} component={Briefings} />
            <Route path="/briefings/:id" component={BriefingDetail} />
            <Route path={"/automated-briefings"} component={AutomatedBriefings} />
            <Route path={"/credits"} component={Credits} />
            <Route path={"/settings"} component={Settings} />
            <Route path={"/teams"} component={Teams} />            <Route path={"/users"} component={Users} />
            <Route path={"/admin-settings"} component={AdminSettings} />
            <Route path={"/help"} component={Help} />
            <Route path={"/404"} component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </AgentLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
