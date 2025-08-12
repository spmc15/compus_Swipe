import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Shield, Bell, Eye, HelpCircle, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <Shield className="w-5 h-5" />,
          label: 'Privacy Settings',
          description: 'Control who can see your profile',
          action: () => toast.info('Privacy settings coming soon!')
        },
        {
          icon: <Bell className="w-5 h-5" />,
          label: 'Notifications',
          description: 'Manage your notification preferences',
          action: () => toast.info('Notification settings coming soon!')
        },
        {
          icon: <Eye className="w-5 h-5" />,
          label: 'Blocked Users',
          description: 'View and manage blocked accounts',
          action: () => toast.info('Blocked users management coming soon!')
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle className="w-5 h-5" />,
          label: 'Help & Support',
          description: 'Get help and report issues',
          action: () => toast.info('Help center coming soon!')
        },
        {
          icon: <Mail className="w-5 h-5" />,
          label: 'Contact Us',
          description: 'Send feedback or report problems',
          action: () => toast.info('Contact form coming soon!')
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {/* User Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-4 mb-4">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center border-4 border-gray-200">
                <span className="text-xl font-bold text-white">
                  {user?.name?.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.college}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (sectionIndex + 1) * 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={item.action}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-gray-600">{item.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.label}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Admin Panel Access */}
        {user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl shadow-lg p-6 text-white"
          >
            <h3 className="text-lg font-semibold mb-2">Admin Access</h3>
            <p className="text-purple-100 mb-4">
              You have administrator privileges. Access the admin panel to manage users and content.
            </p>
            <a
              href="/admin"
              className="inline-block bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Open Admin Panel
            </a>
          </motion.div>
        )}

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <button
            onClick={handleLogout}
            className="w-full p-6 text-left hover:bg-red-50 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4">
              <LogOut className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-600">Logout</h4>
                <p className="text-sm text-red-500">Sign out of your account</p>
              </div>
            </div>
          </button>
        </motion.div>

        {/* App Info */}
        <div className="text-center text-gray-500 text-sm">
          <p>Campus Swipe v1.0.0</p>
          <p className="mt-1">© 2025 Campus Swipe. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
};