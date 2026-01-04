// src/admin/Subscriptions.jsx
import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { toast } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

export default function Subscriptions() {
  const { user } = useContext(AuthContext);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/subscriptions");
      // Handle paginated response
      setSubs(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
      toast.error("Failed to load subscriptions");
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (id) => {
    try {
      await api.post(`/admin/subscriptions/${id}/cancel`);
      toast.success("Subscription cancelled");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel subscription");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar type="admin" />
      <div className="flex-1 ml-64">
        <Navbar userName={user?.name || "Admin"} />

        <main className="p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscriptions</h1>
            <p className="text-gray-600">Manage all user subscriptions</p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading subscriptions...</p>
                </div>
              </div>
            ) : subs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📋</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No subscriptions found</h3>
                <p className="text-gray-600">There are no subscriptions yet.</p>
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
                        Plan
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Cancel Reason
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subs.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {s.user?.name?.charAt(0).toUpperCase() || s.user?.email?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{s.user?.name || "N/A"}</p>
                              <p className="text-xs text-gray-500">{s.user?.email || "-"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {s.plan?.name || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            s.cancelled_at || s.status === 'canceled'
                              ? 'bg-red-100 text-red-800'
                              : s.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {s.cancelled_at || s.status === 'canceled' ? 'Cancelled' : s.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm italic text-gray-500">
                            {s.cancel_reason || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {s.cancel_requested_at && !s.cancelled_at && (
                            <button
                              onClick={() => cancel(s.id)}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                            >
                              Cancel Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
