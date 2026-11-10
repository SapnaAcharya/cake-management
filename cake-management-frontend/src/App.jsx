import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Layouts & shared
import Footer from "./components/Footer";

// Public pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cakes from "./pages/Cakes";
import TrainingCourses from "./pages/training/TrainingCourses";
import CakeDetails from "./pages/CakeDetails";
import DesignByTemplate from "./pages/DesignByTemplate";
import Customizepage from "./components/customization/Customizepage";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Customer account
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyOrders from "./pages/MyOrders";
import OrderDetailsPage from "./pages/OrderDetailsPage";
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
import ManageTrainingPackages from "./pages/admin/ManageTrainingPackage";
import AddTrainingPackage from "./pages/admin/AddTrainingPackage";
import EditTrainingPackage from "./pages/admin/EditTrainingPackage";
import ManageTrainers from "./pages/admin/ManageTrainers";
import AddTrainer from "./pages/admin/AddTrainer";
import EditTrainer from "./pages/admin/EditTrainer";
import ManageTrainingBatches from "./pages/admin/ManageTrainingBatches";
import AddTrainingBatch from "./pages/admin/AddTrainingBatch";
import EditTrainingBatch from "./pages/admin/EditTrainingBatch";
import TrainingCourseDetails from "./pages/training/TrainingCourseDetails";
import ManageTrainingEnrollments from "./pages/admin/ManageTrainingEnrollments";
//import OrderDetailsPage from "./pages/OrderDetailsPage";

// Pages that should not show the footer
const NO_FOOTER_PREFIXES = [
  "/admin",
  "/customize",
  "/design-by-template",
  "/cart",
  "/checkout",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
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
        <Route path="/training" element={<TrainingCourses />} />
        <Route path="/cakes/:slug" element={<CakeDetails />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Customization */}
        <Route path="/design-by-template" element={<DesignByTemplate />} />
        <Route path="/design-by-template/:cakeSlug" element={<DesignByTemplate />} />
        <Route path="/customize/:templateSlug" element={<Customizepage />} />

        {/* Customer account */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/cart/:slug" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/orders/:publicId" element={<OrderDetailsPage />} />
        <Route path="/profile" element={<Profile />} />
       
        {/* Training Courses */}
        <Route path="/training/:id" element={<TrainingCourseDetails />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/cakes" element={<ManageCakes />} />
          <Route path="/admin/cakes/add" element={<AddCake />} />
          <Route path="/admin/cakes/:id/edit" element={<EditCake />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
          <Route path="/admin/orders" element={<ManageOrders />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/templates" element={<TemplatesPage />} />
          <Route path="/admin/templates/add" element={<AddTemplate />} />
          <Route path="/admin/templates/:id/edit" element={<EditTemplate />} />
          <Route path="/admin/decorations" element={<ManageDecorations />} />
          <Route path="/admin/decorations/add" element={<AddDecoration />} />
          <Route path="/admin/decorations/:id/edit" element={<EditDecoration />} />
          <Route path="/admin/training-packages" element={<ManageTrainingPackages />} />
          <Route path="/admin/training-packages/add" element={<AddTrainingPackage />} />
          <Route path="/admin/training-packages/:id/edit" element={<EditTrainingPackage />} />
          <Route path="/admin/trainers" element={<ManageTrainers />} />
          <Route path="/admin/trainers/add" element={<AddTrainer />} />
          <Route path="/admin/trainers/:id/edit" element={<EditTrainer />} />
          <Route path="/admin/training-batches" element={<ManageTrainingBatches />} />
          <Route path="/admin/training-batches/add" element={<AddTrainingBatch />} />
          <Route path="/admin/training-batches/:id/edit" element={<EditTrainingBatch />} />
          <Route path="/admin/training-enrollments" element={<ManageTrainingEnrollments />} />
        {/* </Route> */}
      </Routes>

      {!hideFooter && <Footer />}
    </>
  );
}

export default function App() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error(
      "VITE_GOOGLE_CLIENT_ID is missing from the frontend environment."
    );
  }
  return (
    <GoogleOAuthProvider clientId={googleClientId || ""}>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
    </GoogleOAuthProvider>
  );
}