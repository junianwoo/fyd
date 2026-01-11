import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Doctors from "./pages/Doctors";
import DoctorDetails from "./pages/DoctorDetails";
import Clinics from "./pages/Clinics";
import ClinicDetails from "./pages/ClinicDetails";
import Pricing from "./pages/Pricing";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CheckEmail from "./pages/CheckEmail";
import Dashboard from "./pages/Dashboard";
import AssistedAccess from "./pages/AssistedAccess";
import AssistedAccessConfirmation from "./pages/AssistedAccessConfirmation";
import AssistedAccessRenewal from "./pages/AssistedAccessRenewal";
import ClaimVerify from "./pages/ClaimVerify";
import Admin from "./pages/Admin";
import AdminResourceEditor from "./pages/AdminResourceEditor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 10, // Cache is kept for 10 minutes
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnMount: true, // Refetch when component mounts
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                {/* New clinic routes */}
                <Route path="/clinics" element={<Clinics />} />
                <Route path="/clinics/:id" element={<ClinicDetails />} />
                {/* Legacy doctor routes - keep for backward compatibility */}
                <Route path="/doctors" element={<Clinics />} />
                <Route path="/doctors/:id" element={<ClinicDetails />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/:slug" element={<ResourceDetail />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/check-email" element={<CheckEmail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/assisted-access" element={<AssistedAccess />} />
                <Route path="/assisted-access/confirmation" element={<AssistedAccessConfirmation />} />
                <Route path="/assisted-access/renew" element={<AssistedAccessRenewal />} />
                <Route path="/claim-verify" element={<ClaimVerify />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/resources/:id" element={<AdminResourceEditor />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
