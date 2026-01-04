import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar({ userName = "User" }) {
  const { logout } = useContext(AuthContext);
  
  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      {/* Left Section - Greeting */}
      <div>
        <p className="text-sm text-gray-500">Welcome back,</p>
        <p className="text-lg font-semibold text-gray-900">{userName}</p>
      </div>
      
      {/* Right Section - User Menu */}
      <div className="flex items-center gap-4">
        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700">{userName}</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={logout}
          className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
