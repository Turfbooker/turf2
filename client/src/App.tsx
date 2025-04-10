import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute, RoleProtectedRoute } from "./lib/protected-route";
import PlayerDashboard from "@/pages/player/dashboard";
import TurfDetails from "@/pages/player/turf-details";
import OwnerDashboard from "@/pages/owner/dashboard";
import AddTurf from "@/pages/owner/add-turf";
import ManageTurf from "@/pages/owner/manage-turf";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Player Routes */}
      <RoleProtectedRoute path="/player/dashboard" role="player" component={PlayerDashboard} />
      <RoleProtectedRoute path="/player/turf/:id" role="player" component={TurfDetails} />
      
      {/* Owner Routes */}
      <RoleProtectedRoute path="/owner/dashboard" role="owner" component={OwnerDashboard} />
      <RoleProtectedRoute path="/owner/add-turf" role="owner" component={AddTurf} />
      <RoleProtectedRoute path="/owner/turf/:id" role="owner" component={ManageTurf} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
