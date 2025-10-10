import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CompareProvider } from "@/contexts/CompareContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ReferEarn from "./pages/ReferEarn";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import ProductDetail from "./pages/ProductDetail";
import OrderDetail from "./pages/OrderDetail";
import Category from "./pages/Category";
import Search from "./pages/Search";
import RewardsTerms from "./pages/RewardsTerms";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";
import FAQ from "./pages/FAQ";
import ReturnPolicy from "./pages/ReturnPolicy";
import TrackOrder from "./pages/TrackOrder";
import Wishlist from "./pages/Wishlist";
import Compare from "./pages/Compare";
import WooCommerceSync from "./pages/WooCommerceSync";
import ShippingSettings from "./pages/ShippingSettings";
import RewardsSettings from "./pages/RewardsSettings";
import AdminProject from "./pages/AdminProject";
import WincovaDiscover from "./pages/WincovaDiscover";
import WincovaDiagnosis from "./pages/WincovaDiagnosis";
import EcommerceRoadmap from "./pages/admin/EcommerceRoadmap";
import { RoadmapMetrics } from "./pages/admin/RoadmapMetrics";
import Changelog from "./pages/Changelog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrencyProvider>
      <WishlistProvider>
        <CompareProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/refer-earn" element={<ReferEarn />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/order/:orderId" element={<OrderDetail />} />
                  <Route path="/category/:slug" element={<Category />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/rewards-terms" element={<RewardsTerms />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/return-policy" element={<ReturnPolicy />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/admin/woocommerce-sync" element={<WooCommerceSync />} />
                  <Route path="/admin/shipping-settings" element={<ShippingSettings />} />
                  <Route path="/admin/rewards-settings" element={<RewardsSettings />} />
                  <Route path="/admin/ecommerce-roadmap" element={<EcommerceRoadmap />} />
                  <Route path="/admin/roadmap-metrics" element={<RoadmapMetrics />} />
                  <Route path="/admin/project/*" element={<AdminProject />} />
                  <Route path="/wincova" element={<WincovaDiscover />} />
                  <Route path="/wincova/diagnosis/:diagnosisId" element={<WincovaDiagnosis />} />
                  <Route path="/changelog" element={<Changelog />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </CompareProvider>
      </WishlistProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;
