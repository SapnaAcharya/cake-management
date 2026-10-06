import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Layouts & shared
import AdminLayout from "./layouts/AdminLayout";
import Footer from "./components/Footer";

// Public pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cakes from "./pages/Cakes";
import CakeDetails from "./pages/CakeDetails";
import DesignByTemplate from "./pages/DesignByTemplate";
import Customizepage from "./components/customization/Customizepage";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Customer account
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetailsPage";
import Profile from "./pages/MyProfile";

// Admin
import AdminOverview from "./pages/admin/adminOverview";
import ManageCakes from "./pages/admin/manageCake";
import AddCake from "./pages/admin/AddCake";
import EditCake from "./pages/admin/EditCake";
import ManageCategories from "./pages/admin/manageCategory";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/manageUsers";
import TemplatesPage from "./pages/admin/managetemplate";
import AddTemplate from "./pages/admin/AddTemplates";
import EditTemplate from "./pages/admin/EditTemplates";
import ManageDecorations from "./pages/admin/managedecoration";
import AddDecoration from "./pages/admin/AddDecoration";
import EditDecoration from "./pages/admin/EditDecoration";

// Pages that should not show the footer
const NO_FOOTER_PREFIXES = [
  "/admin",
  "/customize",
  "/design-by-template",
  "/cart",
  "/checkout",
  "/login",
  "/register",
];

function AppContent() {
  const { pathname } = useLocation();
  const hideFooter = NO_FOOTER_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cakes" element={<Cakes />} />
        <Route path="/cakes/:id" element={<CakeDetails />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customization */}
        <Route path="/design-by-template" element={<DesignByTemplate />} />
        <Route path="/design-by-template/:cakeId" element={<DesignByTemplate />} />
        <Route path="/customize/:cakeId" element={<Customizepage />} />
        <Route path="/customize/:cakeId/:templateId" element={<Customizepage />} />

        {/* Customer account */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/orderDetails" element={<OrderDetails />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="cakes" element={<ManageCakes />} />
          <Route path="cakes/add" element={<AddCake />} />
          <Route path="cakes/:id/edit" element={<EditCake />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="templates/add" element={<AddTemplate />} />
          <Route path="templates/:id/edit" element={<EditTemplate />} />
          <Route path="decorations" element={<ManageDecorations />} />
          <Route path="decorations/add" element={<AddDecoration />} />
          <Route path="decorations/:id/edit" element={<EditDecoration />} />
        </Route>
      </Routes>

      {!hideFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}