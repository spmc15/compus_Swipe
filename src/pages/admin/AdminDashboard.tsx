import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, FileText, AlertTriangle, BarChart3, Settings,
  Home, UserCheck, UserX, TrendingUp
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { AdminUsers } from './AdminUsers';
import { AdminReports } from './AdminReports';
import { AdminReinstatements } from './AdminReinstatements';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  frozenUsers: number;
  totalPhotos: number;
  pendingReports: number;
  pendingReinstatements: number;
}

const AdminOverview: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="w-8 h-8" />,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: <UserCheck className="w-8 h-8" />,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Frozen Users',
      value: stats.frozenUsers,
      icon: <UserX className="w-8 h-8" />,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Total Photos',
      value: stats.totalPhotos,
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Pending Reports',
      value: stats.pendingReports,
      icon: <AlertTriangle className="w-8 h-8" />,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Pending Reinstatements',
      value: stats.pendingReinstatements,
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage Campus Swipe platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-xl ${card.color} text-white`}>
                {card.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <Users className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="font-semibold text-blue-900">Manage Users</h3>
              <p className="text-sm text-blue-600">View and moderate user accounts</p>
            </div>
          </Link>

          <Link
            to="/admin/reports"
            className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
          >
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="font-semibold text-red-900">Review Reports</h3>
              <p className="text-sm text-red-600">{stats.pendingReports} pending reports</p>
            </div>
          </Link>

          <Link
            to="/admin/reinstatements"
            className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors duration-200"
          >
            <FileText className="w-6 h-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="font-semibold text-yellow-900">Reinstatements</h3>
              <p className="text-sm text-yellow-600">{stats.pendingReinstatements} pending requests</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    frozenUsers: 0,
    totalPhotos: 0,
    pendingReports: 0,
    pendingReinstatements: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      if (response.success) {
        setStats(response.stats);
      } else {
        toast.error('Failed to load dashboard stats');
      }
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { path: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/reports', label: 'Reports', icon: <AlertTriangle className="w-5 h-5" /> },
    { path: '/admin/reinstatements', label: 'Reinstatements', icon: <FileText className="w-5 h-5" /> }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Link
              to="/"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Back to App</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <Routes>
          <Route index element={<AdminOverview stats={stats} />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="reinstatements" element={<AdminReinstatements />} />
        </Routes>
      </div>
    </div>
  );
};