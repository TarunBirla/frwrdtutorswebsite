import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/dashboard/Dashboard";
import ManageBooking from "./pages/ManageBooking";
import StudentForm from "./pages/forms/StudentForm";
import NewBooking from "./pages/forms/NewBooking";
import Packages from "./pages/Packages";
import CRtutors from "./pages/CRtutors";
import Rescheduling from "./pages/Rescheduling";
import BookClass from "./pages/forms/BookClass";
import BookingSummary from "./pages/BookingSummary";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentSummaryPage from "./pages/PaymentSummaryPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate } from "react-router-dom";
import Forgotpassword from "./pages/auth/Forgotpassword";
import ChangePassword from "./pages/auth/ChangePassword";
import ProfilePage from "./pages/auth/ProfilePage";
import TransactionHistory from "./pages/TransactionHistory";
import ClientPackagesPage from "./pages/auth/ClientPackagesPage";
import PackagesSelection from "./pages/PackagesSelection";
import UpdateBookedClass from "./pages/forms/UpdateBookedClass";
import RemainingBookClass from "./pages/forms/RemainingBookClass";
import RenewPackages from "./pages/RenewPackages";
import VendorEngagementChart from "./pages/dashboard/VendorEngagementChart";
import RenewChangePackages from "./pages/home/RenewChangePackages";
import FreeBookClass from "./pages/forms/FreeBookClass";
import FreeBookingSummary from "./pages/FreeBookingSummary";
import SuccessPage from "./pages/SuccessPage";
import Censelled from "./pages/Censelled";
import FailedPage from "./pages/FailedPage";
import AutoRenew from "./pages/home/AutoRenew";
import BookingSummary2 from "./pages/BookingSummary2";

import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminNewBooking from "./admin/AdminNewBooking";
import AdminBookClass from "./admin/AdminBookClass";
import AdminBookingSummary from "./admin/AdminBookingSummary";
import AdminPackages from "./admin/AdminPackages";
import SuperAdminLogin from "./superadmin/Login";
import SuperAdminDashboard from "./superadmin/Dashboad";
import Clients from "./superadmin/Client";
import Tutors from "./superadmin/Tutors";
import Students from "./superadmin/Students";
import Invoice from "./superadmin/Invoice";
import Appointment from "./superadmin/Appointment";
import StudentsDashboard from "./superadmin/Studentsdashboard";
import TutorsDashboard from "./superadmin/tutorsdashboard";
import InvoicesDashboard from "./superadmin/InvoicesDashboard";
import PaymentsDashboard from "./superadmin/PaymentsDashboard";
import AppointmentsDashboard from "./superadmin/AppointmentsDashboard";
import ClientsDashboard from "./superadmin/Clientsdashboard";
import ClientsStudentDashboard from "./superadmin/ClientsStudentDashboad";

const GuestRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const AdminProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("admintoken");

    const isAdmin = localStorage.getItem("isAdmin");

    if (!token || isAdmin !== "true") {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

const SuperAdminProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("superAdminToken");

    const isSuperAdmin =
        localStorage.getItem("isSuperAdmin");

    if (!token || isSuperAdmin !== "true") {
        return (
            <Navigate
                to="/superadmin/login"
                replace
            />
        );
    }

    return children;
};
const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/login"
                    element={
                        <GuestRoute>
                            <LoginPage />
                        </GuestRoute>
                    }
                />
                {/* <Route
          path="/VendorEngagementChart"
          element={<VendorEngagementChart />}
        /> */}
                <Route
                    path="/forgot-password"
                    element={
                        <GuestRoute>
                            <Forgotpassword />
                        </GuestRoute>
                    }
                />
                <Route
                    path="/changepassword/:id"
                    element={
                        <GuestRoute>
                            <ChangePassword />
                        </GuestRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/manage-booking"
                    element={
                        <ProtectedRoute>
                            <ManageBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/student-form"
                    element={
                        // <ProtectedRoute>
                        <StudentForm />
                        // </ProtectedRoute>
                    }
                />

                <Route
                    path="/new-booking"
                    element={
                        <ProtectedRoute>
                            <NewBooking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/manage-packages"
                    element={
                        <ProtectedRoute>
                            <Packages />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/crtutors"
                    element={
                        <ProtectedRoute>
                            <CRtutors />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/rescheduling"
                    element={
                        <ProtectedRoute>
                            <Rescheduling />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/book-class"
                    element={
                        <ProtectedRoute>
                            <BookClass />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/free-book"
                    element={
                        <ProtectedRoute>
                            <FreeBookClass />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/booking-summary"
                    element={
                        <ProtectedRoute>
                            <BookingSummary />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/bookingsummary"
                    element={
                        <ProtectedRoute>
                            <BookingSummary2 />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/freebooking-summary"
                    element={
                        <ProtectedRoute>
                            <FreeBookingSummary />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute>
                            <CheckoutPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/success"
                    element={
                        <ProtectedRoute>
                            <SuccessPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/failed"
                    element={
                        <ProtectedRoute>
                            <FailedPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/cancel"
                    element={
                        <ProtectedRoute>
                            <Censelled />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payment-successfull"
                    element={
                        <ProtectedRoute>
                            <PaymentSuccessPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payment-summary"
                    element={
                        <ProtectedRoute>
                            <PaymentSummaryPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/remaining-classes"
                    element={
                        <ProtectedRoute>
                            <ClientPackagesPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/remaining-package"
                    element={
                        <ProtectedRoute>
                            <PackagesSelection />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/transaction-history"
                    element={
                        <ProtectedRoute>
                            <TransactionHistory />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/reschedule-slot"
                    element={
                        <ProtectedRoute>
                            <UpdateBookedClass />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/remainingbookclass"
                    element={
                        <ProtectedRoute>
                            <RemainingBookClass />
                        </ProtectedRoute>
                    }
                />
                {/* <Route
          path="/renew-packages"
          element={
            <ProtectedRoute>
              <RenewPackages />
            </ProtectedRoute>
          }
        /> */}
                <Route
                    path="/renew-change-packages"
                    element={
                        <ProtectedRoute>
                            <RenewChangePackages />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/autorenew"
                    element={
                        <ProtectedRoute>
                            <AutoRenew />
                        </ProtectedRoute>
                    }
                />

                <Route path="/admin/login" element={<AdminLogin />} />

                <Route
                    path="/admin/dashboard"
                    element={
                        <AdminProtectedRoute>
                            <AdminDashboard />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin/new-booking"
                    element={
                        <AdminProtectedRoute>
                            <AdminNewBooking />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin/manage-packages"
                    element={
                        <AdminProtectedRoute>
                            <AdminPackages />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin/book-class"
                    element={
                        <AdminProtectedRoute>
                            <AdminBookClass />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin/booking-summary"
                    element={
                        <AdminProtectedRoute>
                            <AdminBookingSummary />
                        </AdminProtectedRoute>
                    }
                />

                <Route
    path="/superadmin/login"
    element={<SuperAdminLogin />}
/>
            <Route
    path="/superadmin/clients"
    element={<Clients />}
/>
<Route
  path="/superadmin/tutors"
  element={<Tutors />}
/>
<Route
  path="/superadmin/students"
  element={<Students />}
/>
<Route
  path="/superadmin/invoices"
  element={<Invoice />}
/>
<Route
  path="/superadmin/students-dashboard"
  element={<StudentsDashboard />}
/>
<Route
    path="/superadmin/clients-student-dashboard"
    element={<ClientsStudentDashboard />}
/>
<Route
  path="/superadmin/clients-dashboard"
  element={<ClientsDashboard />}
/>

<Route
  path="/superadmin/invoices-dashboard"
  element={<InvoicesDashboard />}
/>

<Route
  path="/superadmin/payments-dashboard"
  element={<PaymentsDashboard />}
/>
<Route
  path="/superadmin/appointments-dashboard"
  element={<AppointmentsDashboard />}
/>

<Route
  path="/superadmin/tutors-dashboard"
  element={<TutorsDashboard />}
/>
<Route
 path="/superadmin/appointments"
 element={<Appointment />}
/>
<Route
    path="/superadmin/dashboard"
    element={
        <SuperAdminProtectedRoute>
            <SuperAdminDashboard />
        </SuperAdminProtectedRoute>
    }
/>
            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </BrowserRouter>
    );
};

export default App;
