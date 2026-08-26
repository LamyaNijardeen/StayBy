import { BrowserRouter, Route, Routes } from "react-router-dom";

import Booking from "./pages/Booking";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PropertyDetails from "./pages/PropertyDetails";
import Register from "./pages/Register";
import SearchResults from "./pages/SearchResults";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/booking" element={<Booking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;