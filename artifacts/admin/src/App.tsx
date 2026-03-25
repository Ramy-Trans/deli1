import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import OrdersPage from "@/pages/Orders";
import RidersPage from "@/pages/Riders";
import OrderDetailPage from "@/pages/OrderDetail";
import RiderLoginPage from "@/pages/RiderLogin";
import RiderDashboard from "@/pages/RiderDashboard";
import PromoCodesPage from "@/pages/PromoCodes";

const queryClient = new QueryClient();
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function isAuthed() {
  return !!localStorage.getItem("admin_token");
}

function isRiderAuthed() {
  return !!localStorage.getItem("rider_token");
}

function Guard({ component: Component }: { component: React.ComponentType }) {
  if (!isAuthed()) return <LoginPage />;
  return <Component />;
}

function RiderGuard({ component: Component }: { component: React.ComponentType }) {
  if (!isRiderAuthed()) return <RiderLoginPage />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/rider" component={() => <RiderGuard component={RiderDashboard} />} />
      <Route path="/rider/dashboard" component={() => <RiderGuard component={RiderDashboard} />} />
      <Route path="/" component={() => <Guard component={DashboardPage} />} />
      <Route path="/orders" component={() => <Guard component={OrdersPage} />} />
      <Route path="/orders/:id" component={() => <Guard component={OrderDetailPage} />} />
      <Route path="/riders" component={() => <Guard component={RidersPage} />} />
      <Route path="/promo-codes" component={() => <Guard component={PromoCodesPage} />} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="phone-shell">
        <div className="phone-screen">
          <WouterRouter base={BASE}>
            <Router />
          </WouterRouter>
        </div>
      </div>
    </QueryClientProvider>
  );
}
