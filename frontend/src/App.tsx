import { BrowserRouter, Route, Routes } from "react-router-dom";

import Booking from "./pages/Booking";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PropertyDetails from "./pages/PropertyDetails";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import SearchResults from "./pages/SearchResults";
import MyBookings from "./pages/MyBookings";
import OwnerBookings from "./pages/OwnerBookings";
import OwnerProperties from "./pages/OwnerProperties";
import OwnerAddProperty from "./pages/OwnerAddProperty";
import OwnerRooms from "./pages/OwnerRooms";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerProfile from "./pages/OwnerProfile";
import OwnerEditProperty from "./pages/OwnerEditProperty";
import BookingDetails from "./pages/BookingDetails";
import OwnerBookingDetails from "./pages/OwnerBookingDetails";
import OwnerPayments from "./pages/OwnerPayments";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProperties from "./pages/AdminProperties";
import AdminBookings from "./pages/AdminBookings";
import AdminReviews from "./pages/AdminReviews";
import OwnerRefunds from "./pages/OwnerRefunds";
import Complaints from "./pages/Complaints";
import AdminComplaints from "./pages/AdminComplaints";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            PUBLIC / TRAVELER ROUTES
        ================================================= */}

        <Route path="/" element={<Home />} />

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
          path="/search"
          element={<SearchResults />}
        />

        <Route
          path="/property/:id"
          element={<PropertyDetails />}
        />

        <Route
          path="/booking"
          element={<Booking />}
        />

        <Route
          path="/my-bookings"
          element={<MyBookings />}
        />

        <Route
          path="/my-bookings/:id"
          element={<BookingDetails />}
        />

        <Route
          path="/favorites"
          element={<Favorites />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* =================================================
            OWNER ROUTES
        ================================================= */}

        <Route
          path="/owner/dashboard"
          element={<OwnerDashboard />}
        />

        <Route
          path="/owner/profile"
          element={<OwnerProfile />}
        />

        <Route
          path="/owner/properties"
          element={<OwnerProperties />}
        />

        <Route
          path="/owner/properties/new"
          element={<OwnerAddProperty />}
        />

        <Route
          path="/owner/properties/:propertyId/rooms"
          element={<OwnerRooms />}
        />

        <Route
          path="/owner/properties/:propertyId/edit"
          element={<OwnerEditProperty />}
        />

        <Route
          path="/owner/bookings"
          element={<OwnerBookings />}
        />

        <Route
          path="/owner/bookings/:id"
          element={<OwnerBookingDetails />}
        />

        <Route
          path="/owner/payments"
          element={<OwnerPayments />}
        />

        <Route
          path="/owner/refunds"
          element={<OwnerRefunds />}
        />
        {/* =================================================
            ADMIN ROUTES
        ================================================= */}

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        <Route
          path="/admin/properties"
          element={<AdminProperties />}
        />

        <Route
          path="/admin/bookings"
          element={<AdminBookings />}
        />

        <Route
          path="/admin/reviews"
          element={<AdminReviews />}
        />
        <Route
          path="/complaints"
          element={<Complaints />}
        />

        <Route
  path="/admin/complaints"
  element={<AdminComplaints />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;