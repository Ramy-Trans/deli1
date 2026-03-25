import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import HomePage from "@/pages/Home";
import MenuPage from "@/pages/Menu";
import CheckoutPage from "@/pages/Checkout";
import OrdersPage from "@/pages/Orders";
import OrderDetailPage from "@/pages/OrderDetail";
import GalleryPage from "@/pages/Gallery";

const queryClient = new QueryClient();
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showCart, setShowCart] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <WouterRouter base={BASE}>
              <Navbar onAuthClick={() => setShowAuth(true)} onCartClick={() => setShowCart(true)} />

              <Switch>
                <Route path="/" component={() => <HomePage onAuthRequired={() => setShowAuth(true)} />} />
                <Route path="/menu" component={MenuPage} />
                <Route path="/checkout" component={CheckoutPage} />
                <Route path="/orders" component={() => <OrdersPage onAuthRequired={() => setShowAuth(true)} />} />
                <Route path="/orders/:id" component={OrderDetailPage} />
                <Route path="/gallery" component={GalleryPage} />
                <Route component={() => (
                  <div style={{ textAlign: "center", padding: "100px 24px", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ fontSize: 72, fontWeight: 900, color: "var(--gray-100)", marginBottom: 8 }}>404</p>
                    <p style={{ color: "var(--dark)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Page not found</p>
                    <p style={{ color: "var(--gray-400)", fontSize: 14, marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
                    <a href="/" className="sg-btn sg-btn-primary" style={{ textDecoration: "none", padding: "12px 28px" }}>Go Home</a>
                  </div>
                )} />
              </Switch>

              {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
              {showCart && <CartDrawer onClose={() => setShowCart(false)} onAuthRequired={() => { setShowCart(false); setShowAuth(true); }} />}
            </WouterRouter>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
