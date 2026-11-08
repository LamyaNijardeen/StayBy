import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const Booking = lazy(() => import("./pages/Booking"));
import Home from "./pages/Home";
import Login from "./pages/Login";
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
import Register from "./pages/Register";
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const OwnerBookings = lazy(() => import("./pages/OwnerBookings"));
const OwnerProperties = lazy(() => import("./pages/OwnerProperties"));
const OwnerAddProperty = lazy(() => import("./pages/OwnerAddProperty"));
const OwnerRooms = lazy(() => import("./pages/OwnerRooms"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Profile = lazy(() => import("./pages/Profile"));
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const OwnerProfile = lazy(() => import("./pages/OwnerProfile"));
const OwnerEditProperty = lazy(() => import("./pages/OwnerEditProperty"));
const BookingDetails = lazy(() => import("./pages/BookingDetails"));
const OwnerBookingDetails = lazy(() => import("./pages/OwnerBookingDetails"));
const OwnerPayments = lazy(() => import("./pages/OwnerPayments"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminProperties = lazy(() => import("./pages/AdminProperties"));
const AdminBookings = lazy(() => import("./pages/AdminBookings"));
const AdminReviews = lazy(() => import("./pages/AdminReviews"));
const OwnerRefunds = lazy(() => import("./pages/OwnerRefunds"));
const Complaints = lazy(() => import("./pages/Complaints"));
const AdminComplaints = lazy(() => import("./pages/AdminComplaints"));
const PaymentReturn = lazy(() => import("./pages/PaymentReturn"));
const InfoPage = lazy(() => import("./pages/InfoPage"));
import RequireRole from "./components/RequireRole";
import DialogHost from "./components/DialogHost";
import ScrollToTop from "./components/ScrollToTop";
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <DialogHost />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-coral)]" />
          </div>
        }
      >
      <Routes>

        {/* =================================================
            PUBLIC / TRAVELER ROUTES
        ================================================= */}

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<InfoPage />} />
        <Route path="/contact" element={<InfoPage />} />
        <Route path="/help" element={<InfoPage />} />
        <Route path="/faqs" element={<InfoPage />} />
        <Route path="/privacy" element={<InfoPage />} />
        <Route path="/terms" element={<InfoPage />} />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/search"
          element={<SearchResults />}
        />

        <Route
          path="/property/:id"
          element={<PropertyDetails />}
        />

        <Route
          path="/booking"
          element={<RequireRole roles={["TRAVELER"]}><Booking /></RequireRole>}
        />

        <Route
          path="/my-bookings"
          element={<RequireRole roles={["TRAVELER"]}><MyBookings /></RequireRole>}
        />

        <Route
          path="/my-bookings/:id"
          element={<RequireRole roles={["TRAVELER"]}><BookingDetails /></RequireRole>}
        />

        <Route
          path="/favorites"
          element={<RequireRole roles={["TRAVELER"]}><Favorites /></RequireRole>}
        />

        <Route
          path="/payment/return"
          element={<RequireRole ><PaymentReturn /></RequireRole>}
        />

        <Route
          path="/payment/cancel"
          element={<RequireRole ><PaymentReturn /></RequireRole>}
        />

        <Route
          path="/profile"
          element={<RequireRole roles={["TRAVELER"]}><Profile /></RequireRole>}
        />

        {/* =================================================
            OWNER ROUTES
        ================================================= */}

        <Route
          path="/owner/dashboard"
          element={<RequireRole roles={["OWNER"]}><OwnerDashboard /></RequireRole>}
        />

        <Route
          path="/owner/profile"
          element={<RequireRole roles={["OWNER"]}><OwnerProfile /></RequireRole>}
        />

        <Route
          path="/owner/properties"
          element={<RequireRole roles={["OWNER"]}><OwnerProperties /></RequireRole>}
        />

        <Route
          path="/owner/properties/new"
          element={<RequireRole roles={["OWNER"]}><OwnerAddProperty /></RequireRole>}
        />

        <Route
          path="/owner/properties/:propertyId/rooms"
          element={<RequireRole roles={["OWNER"]}><OwnerRooms /></RequireRole>}
        />

        <Route
          path="/owner/properties/:propertyId/edit"
          element={<RequireRole roles={["OWNER"]}><OwnerEditProperty /></RequireRole>}
        />

        <Route
          path="/owner/bookings"
          element={<RequireRole roles={["OWNER"]}><OwnerBookings /></RequireRole>}
        />

        <Route
          path="/owner/bookings/:id"
          element={<RequireRole roles={["OWNER"]}><OwnerBookingDetails /></RequireRole>}
        />

        <Route
          path="/owner/payments"
          element={<RequireRole roles={["OWNER"]}><OwnerPayments /></RequireRole>}
        />

        <Route
          path="/owner/refunds"
          element={<RequireRole roles={["OWNER"]}><OwnerRefunds /></RequireRole>}
        />
        {/* =================================================
            ADMIN ROUTES
        ================================================= */}

        <Route
          path="/admin/dashboard"
          element={<RequireRole roles={["ADMIN"]}><AdminDashboard /></RequireRole>}
        />

        <Route
          path="/admin/users"
          element={<RequireRole roles={["ADMIN"]}><AdminUsers /></RequireRole>}
        />

        <Route
          path="/admin/properties"
          element={<RequireRole roles={["ADMIN"]}><AdminProperties /></RequireRole>}
        />

        <Route
          path="/admin/bookings"
          element={<RequireRole roles={["ADMIN"]}><AdminBookings /></RequireRole>}
        />

        <Route
          path="/admin/reviews"
          element={<RequireRole roles={["ADMIN"]}><AdminReviews /></RequireRole>}
        />
        <Route
          path="/complaints"
          element={<RequireRole roles={["TRAVELER"]}><Complaints /></RequireRole>}
        />

        <Route
  path="/admin/complaints"
  element={<RequireRole roles={["ADMIN"]}><AdminComplaints /></RequireRole>}
/>
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;