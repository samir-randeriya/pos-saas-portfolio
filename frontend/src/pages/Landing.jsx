import { Link } from "react-router-dom";

export default function Landing() {
  const features = [
    { icon: "🏢", title: "Multi-tenant", description: "Isolated data for each business" },
    { icon: "💳", title: "Flexible Plans", description: "Choose what fits your needs" },
    { icon: "📦", title: "Modular POS", description: "Sales, inventory & more" },
    { icon: "⚙️", title: "Admin Panel", description: "Complete control & insights" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🏪</span>
            </div>
            <span className="text-xl font-bold text-gray-900">POS SaaS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link 
              to="/register"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-8">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-blue-700">Production-Ready SaaS Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Modern POS for
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Modern Businesses
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
            A powerful, multi-tenant Point of Sale system with flexible subscription plans 
            and modular features. Built for scale, designed for simplicity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-lg shadow-blue-500/30"
            >
              Start Free Trial
            </Link>
            <Link 
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-gray-300"
            >
              View Demo
            </Link>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-gray-500">
            Trusted by businesses worldwide • No credit card required
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:scale-105 transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-3xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold mb-2">99.9%</p>
              <p className="text-blue-100">Uptime</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">24/7</p>
              <p className="text-blue-100">Support</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">1000+</p>
              <p className="text-blue-100">Active Users</p>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to transform your business?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using our platform to streamline their operations.
          </p>
          <Link 
            to="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-lg shadow-blue-500/30"
          >
            Get Started Now →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🏪</span>
            </div>
            <span className="text-xl font-bold">POS SaaS</span>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            © 2026 POS SaaS Portfolio. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
