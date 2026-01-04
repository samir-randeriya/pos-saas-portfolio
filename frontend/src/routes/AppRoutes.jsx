import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../auth/Login";
import Register from "../auth/Register";
import Dashboard from "../client/Dashboard";
import Billing from "../client/Billing";
import Users from "../admin/Users";
import Subscriptions from "../admin/Subscriptions";
import AdminDashboard from "../admin/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/app/dashboard" element={
        <ProtectedRoute clientOnly>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/app/billing" element={
        <ProtectedRoute clientOnly>
          <Billing />
        </ProtectedRoute>
      } />

      <Route path="/admin/dashboard" element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute role="admin">
          <Users />
        </ProtectedRoute>
      } />

      <Route path="/admin/subscriptions" element={
        <ProtectedRoute role="admin">
          <Subscriptions />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
