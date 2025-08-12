import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Bell, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Campus Swipe</span>
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/leaderboard" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Leaderboard
            </Link>
            <Link 
              to="/upload" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Upload
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <Link 
              to="/settings"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 lg:hidden"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Link>

            <Link to={`/profile/${user?.id}`} className="flex items-center space-x-2">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
              )}
              <span className="hidden lg:block text-gray-700 font-medium">
                {user?.name}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};