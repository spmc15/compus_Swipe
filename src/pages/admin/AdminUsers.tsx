import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MoreHorizontal, UserCheck, UserX, Ban, Eye } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  college: string;
  status: 'active' | 'frozen' | 'suspended';
  score: number;
  followers: number;
  totalPhotos: number;
  createdAt: string;
  lastActive: string;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionModal, setActionModal] = useState<{ type: string; user: User } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter]);

  const fetchUsers = async () => {
    try {
      const params: any = { page: 1, limit: 50 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/admin/users', { params });
      
      if (response.success) {
        setUsers(response.users);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string, reason: string) => {
    try {
      let status = '';
      switch (action) {
        case 'activate':
          status = 'active';
          break;
        case 'freeze':
          status = 'frozen';
          break;
        case 'suspend':
          status = 'suspended';
          break;
        default:
          return;
      }

      const response = await api.put(`/admin/users/${userId}/status`, {
        status,
        reason
      });

      if (response.success) {
        toast.success(`User ${action}d successfully`);
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, status: status as any } : user
        ));
        setActionModal(null);
      } else {
        toast.error(`Failed to ${action} user`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <UserCheck className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'frozen':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <UserX className="w-3 h-3 mr-1" />
            Frozen
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Ban className="w-3 h-3 mr-1" />
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  const ActionModal: React.FC<{ action: { type: string; user: User } }> = ({ action }) => {
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!reason.trim()) {
        toast.error('Please provide a reason');
        return;
      }
      handleUserAction(action.user._id, action.type, reason);
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {action.type === 'activate' && 'Activate User'}
            {action.type === 'freeze' && 'Freeze User Account'}
            {action.type === 'suspend' && 'Suspend User Account'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            You are about to {action.type} <strong>{action.user.name}</strong>. This action will affect their ability to use the platform.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Provide a detailed reason for this action..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                  action.type === 'activate'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : action.type === 'freeze'
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {action.type === 'activate' && 'Activate User'}
                {action.type === 'freeze' && 'Freeze Account'}
                {action.type === 'suspend' && 'Suspend Account'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or college..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="frozen">Frozen</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    College
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.college}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{user.score} points</div>
                        <div>{user.followers} followers</div>
                        <div>{user.totalPhotos} photos</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastActive).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {user.status === 'active' && (
                          <button
                            onClick={() => setActionModal({ type: 'freeze', user })}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Freeze
                          </button>
                        )}
                        {user.status === 'frozen' && (
                          <button
                            onClick={() => setActionModal({ type: 'activate', user })}
                            className="text-green-600 hover:text-green-900"
                          >
                            Activate
                          </button>
                        )}
                        {user.status !== 'suspended' && (
                          <button
                            onClick={() => setActionModal({ type: 'suspend', user })}
                            className="text-red-600 hover:text-red-900"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && <ActionModal action={actionModal} />}
    </div>
  );
};