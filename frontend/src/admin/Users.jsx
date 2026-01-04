import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { toast } from "react-hot-toast";

export default function Users() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [changeReason, setChangeReason] = useState("");
  const [changingPlan, setChangingPlan] = useState(false);

  useEffect(() => {
    loadUsers();
    loadPlans();
  }, []);

  const loadUsers = () => {
    api.get("/admin/users")
      .then(res => {
        // Handle paginated response
        setUsers(res.data.data || res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch users:", err);
        setLoading(false);
      });
  };

  const loadPlans = () => {
    // Fetch plans from dashboard or create a plans endpoint
    // For now, we'll use hardcoded plans matching backend
    setPlans([
      { id: 2, name: "Silver", price: 999 },
      { id: 3, name: "Gold", price: 2499 },
    ]);
  };

  const impersonate = async (id) => {
    try {
      // Store admin token before impersonating
      const adminToken = localStorage.getItem("token");
      if (adminToken) {
        localStorage.setItem("admin_token", adminToken);
      }
      
      const res = await api.post(`/admin/impersonate/${id}`);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("impersonating", "true");
      window.location.href = "/app/dashboard";
    } catch (err) {
      toast.error("Failed to impersonate user: " + (err.response?.data?.message || err.message));
    }
  };

  const openPlanModal = (user) => {
    setSelectedUser(user);
    setSelectedPlanId(null);
    setChangeReason("");
    setShowPlanModal(true);
  };

  const handleChangePlan = async () => {
    if (!selectedPlanId) {
      toast.error("Please select a plan");
      return;
    }

    if (!selectedUser) return;

    setChangingPlan(true);
    try {
      const res = await api.post(`/admin/users/${selectedUser.id}/change-plan`, {
        plan_id: selectedPlanId,
        reason: changeReason || null,
      });

      toast.success(res.data.message || "Plan changed successfully");
      setShowPlanModal(false);
      loadUsers(); // Refresh users list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change plan");
    } finally {
      setChangingPlan(false);
    }
  };

  const handleCancelSubscription = async (userId) => {
    if (!confirm("Are you sure you want to cancel this user's subscription? This action cannot be undone.")) {
      return;
    }

    try {
      // First find the subscription ID
      const user = users.find(u => u.id === userId);
      if (!user?.subscription?.id) {
        toast.error("No active subscription found");
        return;
      }

      await api.post(`/admin/subscriptions/${user.subscription.id}/cancel`);
      toast.success("Subscription cancelled successfully");
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel subscription");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar type="admin" />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Navbar */}
        <Navbar userName={user?.name || "Admin"} />
        
        {/* Page Content */}
        <main className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">View and manage all registered users</p>
          </div>

          {/* Users Table Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading users...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">👥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">There are no registered users yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Subscription Plan
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                              <p className="text-xs text-gray-500">ID: {u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-700">{u.email}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u.subscription?.plan?.name ? (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white shadow-sm">
                              {u.subscription.plan.name}
                            </span>
                          ) : (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-700">
                              No Plan
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => openPlanModal(u)}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                            >
                              <span>🔄</span>
                              Change Plan
                            </button>
                            {u.subscription?.id && (
                              <button 
                                onClick={() => handleCancelSubscription(u.id)}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                              >
                                <span>❌</span>
                                Cancel
                              </button>
                            )}
                            <button 
                              onClick={() => impersonate(u.id)}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                            >
                              <span>🎭</span>
                              Impersonate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info Footer */}
          {users.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{users.length}</span> user(s)
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Change Plan Modal */}
      {showPlanModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Change User Plan</h2>
            
            {/* User Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">User</p>
              <p className="font-semibold text-gray-900">{selectedUser.name}</p>
              <p className="text-sm text-gray-600">{selectedUser.email}</p>
              <div className="mt-2">
                <p className="text-sm text-gray-600">Current Plan:</p>
                <p className="font-semibold text-gray-900">
                  {selectedUser.subscription?.plan?.name 
                    ? selectedUser.subscription.plan.name.charAt(0).toUpperCase() + selectedUser.subscription.plan.name.slice(1)
                    : "No Plan"}
                </p>
              </div>
            </div>

            {/* Plan Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Plan
              </label>
              {(() => {
                const availablePlans = plans.filter(plan => {
                  // Filter out current plan to prevent selecting same plan
                  const currentPlanId = selectedUser.subscription?.plan?.id;
                  return plan.id !== currentPlanId;
                });

                if (availablePlans.length === 0) {
                  return (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <p className="text-sm text-gray-600">
                        No other plans available. User is already on the highest/lowest plan.
                      </p>
                    </div>
                  );
                }

                return (
                  <select
                    value={selectedPlanId || ""}
                    onChange={(e) => setSelectedPlanId(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">-- Select Plan --</option>
                    {availablePlans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} (₹{plan.price}/month)
                      </option>
                    ))}
                  </select>
                );
              })()}
            </div>

            {/* Reason (Optional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="e.g., Complimentary upgrade, Fix billing issue..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Warning */}
            {selectedPlanId && selectedUser.subscription?.plan && (
              <div className="flex flex-col gap-2 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Important Notice</span>
                </p>
                <p className="text-sm text-amber-800 pl-6">
                  {(() => {
                    const currentPlan = selectedUser.subscription.plan.name.toLowerCase();
                    const newPlan = plans.find(p => p.id === selectedPlanId)?.name.toLowerCase();
                    const isDowngrade = (newPlan === 'silver' && currentPlan === 'gold') || 
                                        (newPlan === 'free' && currentPlan !== 'free');
                    const isUpgrade = (newPlan === 'gold' && currentPlan === 'silver') ||
                                      (newPlan === 'silver' && currentPlan === 'free');
                    
                    if (isDowngrade) {
                      return "This is a downgrade. The current plan will expire immediately and access will switch to the new plan right away. No refunds or proration.";
                    } else if (isUpgrade) {
                      return "This is an upgrade. The current plan will expire immediately and the new plan will start right away. No payment will be collected.";
                    }
                    return "The current plan will expire immediately and the new plan will start right away. No payment will be collected.";
                  })()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowPlanModal(false)}
                disabled={changingPlan}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlan}
                disabled={changingPlan || !selectedPlanId}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPlan ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Changing...
                  </span>
                ) : (
                  "Change Plan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
