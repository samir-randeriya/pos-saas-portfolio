import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then(res => setData(res.data));
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar type="client" />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Navbar */}
        <Navbar userName={data.user.name} />
        
        {/* Page Content */}
        <main className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your subscription overview.</p>
          </div>

          {/* Subscription Status Card */}
          <div className="mb-8">
            {data.subscription && data.subscription.plan ? (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium uppercase tracking-wide mb-2">Current Plan</p>
                    <h2 className="text-4xl font-bold mb-3">{data.subscription.plan.name}</h2>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        data.subscription.status === 'active' 
                          ? 'bg-green-400 text-green-900' 
                          : 'bg-yellow-400 text-yellow-900'
                      }`}>
                        {data.subscription.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-blue-100 text-sm">
                      Access to {data.modules?.length || 0} module(s)
                    </p>
                  </div>
                  <div className="text-6xl opacity-20">
                    💎
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium uppercase tracking-wide mb-2">Subscription Status</p>
                    <h2 className="text-3xl font-bold mb-3">No Active Plan</h2>
                    <p className="text-orange-100 mb-6">
                      {data.message || "Upgrade to unlock powerful POS features."}
                    </p>
                    <Link 
                      to="/app/billing"
                      className="inline-block bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors shadow-lg"
                    >
                      View Plans →
                    </Link>
                  </div>
                  <div className="text-6xl opacity-20">
                    ⚠️
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Available Modules Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Available Modules</h3>
                <p className="text-gray-600 text-sm">Access your POS features based on your subscription</p>
              </div>
              {data.modules && data.modules.length > 0 && (
                <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold text-sm">
                  {data.modules.length} Active
                </span>
              )}
            </div>
            
            {data.modules && data.modules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.modules.map(m => (
                  <div 
                    key={m.id} 
                    className="group border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        📦
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                          {m.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-sm text-gray-500">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📭</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No modules available</h4>
                <p className="text-gray-600 mb-6">Upgrade your plan to access powerful POS features.</p>
                <Link 
                  to="/app/billing"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Upgrade Now
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
