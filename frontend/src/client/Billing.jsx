import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function Billing() {
  const { user } = useContext(AuthContext);

  const [currentPlan, setCurrentPlan] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const isCancellationPending = Boolean(subscriptionData?.cancel_requested_at);

  /**
   * Fetch subscription info
   */
  useEffect(() => {
    api.get("/dashboard").then(res => {
      if (res.data.subscription?.plan) {
        setCurrentPlan(res.data.subscription.plan.name.toLowerCase());
        setSubscriptionData(res.data.subscription);
      }
    });
  }, []);

  /**
   * Upgrade plan (Razorpay)
   */
  const upgrade = async (plan_id) => {
    try {
      const res = await api.post("/payment/order", { plan_id });

      // Validate response
      if (!res.data || !res.data.id || !res.data.amount) {
        console.error('Invalid response from payment order:', res.data);
        toast.error("Invalid response from payment server. Please try again.");
        return;
      }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: res.data.amount,
        currency: res.data.currency || "INR",
        name: "POS SaaS",
        description: "Subscription Upgrade",
        order_id: res.data.id,

        method: {
          card: true,
          upi: true,
          netbanking: false,
          wallet: false,
          emi: false,
          paylater: false,
        },

        handler: async (response) => {
          try {
            await api.post("/payment/verify", {
              plan_id,
              order_id: res.data.id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            
            // Show success message from backend
            const successMessage = res.data.message || "Payment successful! Subscription activated.";
            toast.success(successMessage);
            
            // Refresh subscription data
            const dashboardRes = await api.get("/dashboard");
            if (dashboardRes.data.subscription?.plan) {
              setCurrentPlan(dashboardRes.data.subscription.plan.name.toLowerCase());
              setSubscriptionData(dashboardRes.data.subscription);
            }
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              window.location.href = "/app/dashboard";
            }, 1500);
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed");
            console.error("Payment verification error:", err);
          }
        },

        modal: {
          ondismiss: () => toast.error("Payment cancelled"),
        },

        theme: {
          color: "#2563eb",
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    }
  };

  /**
   * Request cancellation
   */
  const handleCancelPlan = async () => {
    try {
      const res = await api.post("/subscription/request-cancel");
      toast.success(res.data.message || "Cancellation request sent");

      setSubscriptionData(prev => ({
        ...prev,
        cancel_requested_at: new Date().toISOString(),
      }));

      setShowCancelModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request cancellation");
    }
  };

  /**
   * Undo cancellation request
   */
  const handleContinuePlan = async () => {
    try {
      const res = await api.post("/subscription/cancel-request");
      toast.success(res.data.message || "Cancellation request withdrawn");

      setSubscriptionData(prev => ({
        ...prev,
        cancel_requested_at: null,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to continue subscription");
    }
  };

  /**
   * Helpers
   */
  const isCurrentPlan = (name) =>
    currentPlan && name.toLowerCase() === currentPlan.toLowerCase();

  /**
   * Check if switching to a plan is a downgrade
   */
  const isDowngrade = (planId) => {
    if (!subscriptionData?.plan) return false;
    
    // Plan prices: Silver (id: 2) = ₹999, Gold (id: 3) = ₹2,499
    const planPrices = {
      2: 999,  // Silver
      3: 2499, // Gold
    };
    
    const currentPlanId = subscriptionData.plan.id;
    const currentPrice = planPrices[currentPlanId] || 0;
    const newPrice = planPrices[planId] || 0;
    
    return newPrice < currentPrice;
  };

  /**
   * Plans (frontend only)
   */
  const plans = [
    {
      id: 2,
      name: "Silver",
      price: "₹999",
      period: "/month",
      gradient: "from-gray-600 to-gray-700",
      features: [
        "Sales & Inventory modules",
        "Up to 1,000 products",
        "5 users",
        "Email support",
      ],
      icon: "🥈",
    },
    {
      id: 3,
      name: "Gold",
      price: "₹2,499",
      period: "/month",
      gradient: "from-yellow-500 to-orange-500",
      features: [
        "All Silver features",
        "Unlimited products",
        "Unlimited users",
        "Priority support",
      ],
      icon: "👑",
      popular: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar type="client" />

      <div className="flex-1 ml-64">
        <Navbar userName={user?.name || "User"} />

        <main className="p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-2">Billing & Plans</h1>
            <p className="text-gray-600">Manage your subscription</p>
          </div>

          {/* Plans */}
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {plans.map(plan => {
              const isActive = isCurrentPlan(plan.name);

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-xl p-8 border-2 shadow ${
                    isActive ? "border-blue-500" : "border-gray-200"
                  }`}
                >
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-2">{plan.icon}</div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <div className="text-4xl font-bold mt-3">
                      {plan.price}
                      <span className="text-lg text-gray-500">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex gap-2 text-gray-700">
                        ✔ {f}
                      </li>
                    ))}
                  </ul>

                  {/* Downgrade Warning */}
                  {!isActive && isDowngrade(plan.id) && (
                    <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>
                          <strong>Downgrade Notice:</strong> Your current plan will expire immediately and access will switch to {plan.name} plan right away. No refunds or proration.
                        </span>
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  {isActive && isCancellationPending ? (
                    <div className="space-y-3">
                      <button
                        disabled
                        className="w-full py-3 bg-gray-300 rounded font-semibold"
                      >
                        Cancellation Requested
                      </button>
                      <button
                        onClick={handleContinuePlan}
                        className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded font-semibold hover:bg-blue-50"
                      >
                        Continue Subscription
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        isActive ? setShowCancelModal(true) : upgrade(plan.id)
                      }
                      className={`w-full py-3 rounded text-white font-semibold bg-gradient-to-r ${
                        isActive
                          ? "from-red-500 to-red-600"
                          : isDowngrade(plan.id)
                          ? "from-orange-500 to-orange-600"
                          : plan.gradient
                      }`}
                    >
                      {isActive 
                        ? "Cancel Plan" 
                        : isDowngrade(plan.id)
                        ? `Downgrade to ${plan.name}`
                        : `Upgrade to ${plan.name}`
                      }
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-3">Cancel Subscription</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to request cancellation?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 border py-2 rounded"
              >
                Keep Plan
              </button>
              <button
                onClick={handleCancelPlan}
                className="flex-1 bg-red-600 text-white py-2 rounded"
              >
                Request Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
