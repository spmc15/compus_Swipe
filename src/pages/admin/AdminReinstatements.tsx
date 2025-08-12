import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, X, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Reinstatement {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    college: string;
    status: string;
  };
  reason: string;
  evidence: string;
  status: 'pending' | 'approved' | 'denied';
  adminNotes?: string;
  reviewedBy?: {
    _id: string;
    name: string;
  };
  reviewedAt?: string;
  createdAt: string;
}

export const AdminReinstatements: React.FC = () => {
  const [reinstatements, setReinstatements] = useState<Reinstatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewModal, setReviewModal] = useState<Reinstatement | null>(null);

  useEffect(() => {
    fetchReinstatements();
  }, [statusFilter]);

  const fetchReinstatements = async () => {
    try {
      const params: any = { page: 1, limit: 50 };
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/admin/reinstatements', { params });
      
      if (response.success) {
        setReinstatements(response.reinstatements);
      } else {
        toast.error('Failed to load reinstatement requests');
      }
    } catch (error) {
      toast.error('Failed to load reinstatement requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewReinstatement = async (reinstatementId: string, reviewData: any) => {
    try {
      const response = await api.put(`/admin/reinstatements/${reinstatementId}/review`, reviewData);
      
      if (response.success) {
        toast.success(`Reinstatement request ${reviewData.status}`);
        setReinstatements(prev => prev.map(reinstatement => 
          reinstatement._id === reinstatementId 
            ? { ...reinstatement, ...reviewData, reviewedAt: new Date().toISOString() }
            : reinstatement
        ));
        setReviewModal(null);
      } else {
        toast.error('Failed to review reinstatement request');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to review reinstatement request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
      case 'denied':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Denied</span>;
      default:
        return null;
    }
  };

  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case 'frozen':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Frozen</span>;
      case 'suspended':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Suspended</span>;
      default:
        return null;
    }
  };

  const ReviewModal: React.FC<{ reinstatement: Reinstatement }> = ({ reinstatement }) => {
    const [reviewData, setReviewData] = useState({
      status: 'approved' as 'approved' | 'denied',
      adminNotes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!reviewData.adminNotes.trim()) {
        toast.error('Please provide admin notes');
        return;
      }
      handleReviewReinstatement(reinstatement._id, reviewData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Review Reinstatement Request</h3>
            <button
              onClick={() => setReviewModal(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Request Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{reinstatement.user.name}</p>
                  <p className="text-sm text-gray-500">{reinstatement.user.email}</p>
                  <p className="text-sm text-gray-500">{reinstatement.user.college}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Status:</p>
                  {getUserStatusBadge(reinstatement.user.status)}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Reinstatement Reason</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{reinstatement.reason}</p>
            </div>

            {reinstatement.evidence && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Evidence Provided</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{reinstatement.evidence}</p>
              </div>
            )}
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decision
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="approved"
                      checked={reviewData.status === 'approved'}
                      onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value as 'approved' | 'denied' }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-green-700 font-medium">Approve - Reinstate user account</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="denied"
                      checked={reviewData.status === 'denied'}
                      onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value as 'approved' | 'denied' }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-red-700 font-medium">Deny - Keep account frozen/suspended</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes *
                </label>
                <textarea
                  value={reviewData.adminNotes}
                  onChange={(e) => setReviewData(prev => ({ ...prev, adminNotes: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Provide detailed reasoning for your decision..."
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                  reviewData.status === 'approved'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {reviewData.status === 'approved' ? 'Approve Request' : 'Deny Request'}
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
        <h1 className="text-2xl font-bold text-gray-900">Reinstatement Requests</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : reinstatements.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {reinstatements.map((reinstatement) => (
              <motion.div
                key={reinstatement._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <FileText className="w-6 h-6 text-blue-500" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            Reinstatement request from {reinstatement.user.name}
                          </h3>
                          {getStatusBadge(reinstatement.status)}
                        </div>
                        
                        <div className="mb-2">
                          <span className="text-sm text-gray-600">Current Status: </span>
                          {getUserStatusBadge(reinstatement.user.status)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">College:</span> {reinstatement.user.college}
                        </p>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-900 mb-1">Reason for reinstatement:</p>
                          <p className="text-sm text-gray-600 line-clamp-3">{reinstatement.reason}</p>
                        </div>
                        
                        {reinstatement.evidence && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-900 mb-1">Evidence provided:</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{reinstatement.evidence}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Submitted: {new Date(reinstatement.createdAt).toLocaleDateString()}</span>
                          {reinstatement.reviewedAt && reinstatement.reviewedBy && (
                            <>
                              <span>•</span>
                              <span>Reviewed by: {reinstatement.reviewedBy.name}</span>
                              <span>•</span>
                              <span>Reviewed: {new Date(reinstatement.reviewedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                        
                        {reinstatement.adminNotes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">Admin Decision:</span> {reinstatement.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4">
                    {reinstatement.status === 'pending' && (
                      <button
                        onClick={() => setReviewModal(reinstatement)}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reinstatement requests</h3>
            <p className="text-gray-600">
              {statusFilter 
                ? `No requests with status "${statusFilter}" found.`
                : "No reinstatement requests have been submitted yet."
              }
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && <ReviewModal reinstatement={reviewModal} />}
    </div>
  );
};