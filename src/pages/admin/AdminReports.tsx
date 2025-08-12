import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Eye, CheckCircle, X } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Report {
  _id: string;
  reportedUser: {
    _id: string;
    name: string;
    email: string;
    college: string;
    status: string;
  };
  reportedBy: {
    _id: string;
    name: string;
    email: string;
  };
  reportedPhoto?: {
    _id: string;
    imageUrl: string;
  };
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
  actionTaken: string;
  createdAt: string;
  reviewedAt?: string;
}

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewModal, setReviewModal] = useState<Report | null>(null);

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      const params: any = { page: 1, limit: 50 };
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/admin/reports', { params });
      
      if (response.success) {
        setReports(response.reports);
      } else {
        toast.error('Failed to load reports');
      }
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewReport = async (reportId: string, reviewData: any) => {
    try {
      const response = await api.put(`/admin/reports/${reportId}/review`, reviewData);
      
      if (response.success) {
        toast.success('Report reviewed successfully');
        setReports(prev => prev.map(report => 
          report._id === reportId ? { ...report, ...reviewData, reviewedAt: new Date().toISOString() } : report
        ));
        setReviewModal(null);
      } else {
        toast.error('Failed to review report');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to review report');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'reviewed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Reviewed</span>;
      case 'resolved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Resolved</span>;
      case 'dismissed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Dismissed</span>;
      default:
        return null;
    }
  };

  const ReviewModal: React.FC<{ report: Report }> = ({ report }) => {
    const [reviewData, setReviewData] = useState({
      status: 'reviewed',
      actionTaken: 'none',
      adminNotes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!reviewData.adminNotes.trim()) {
        toast.error('Please provide admin notes');
        return;
      }
      handleReviewReport(report._id, reviewData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Review Report</h3>
            <button
              onClick={() => setReviewModal(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Report Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-900">Reported User</h4>
                <p className="text-sm text-gray-600">{report.reportedUser.name}</p>
                <p className="text-sm text-gray-500">{report.reportedUser.email}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Reported By</h4>
                <p className="text-sm text-gray-600">{report.reportedBy.name}</p>
                <p className="text-sm text-gray-500">{report.reportedBy.email}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Reason</h4>
              <p className="text-sm text-gray-600 capitalize">{report.reason.replace('_', ' ')}</p>
            </div>

            {report.description && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{report.description}</p>
              </div>
            )}

            {report.reportedPhoto && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Reported Photo</h4>
                <img
                  src={report.reportedPhoto.imageUrl}
                  alt="Reported content"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={reviewData.status}
                  onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="reviewed">Reviewed</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Taken
                </label>
                <select
                  value={reviewData.actionTaken}
                  onChange={(e) => setReviewData(prev => ({ ...prev, actionTaken: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">No Action</option>
                  <option value="warning">Warning Issued</option>
                  <option value="content_removed">Content Removed</option>
                  <option value="account_frozen">Account Frozen</option>
                  <option value="account_suspended">Account Suspended</option>
                </select>
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
                  placeholder="Provide detailed notes about your review and any actions taken..."
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
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Submit Review
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
        <h1 className="text-2xl font-bold text-gray-900">Reports Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Reports</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : reports.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {reports.map((report) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            Report against {report.reportedUser.name}
                          </h3>
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Reason:</span> {report.reason.replace('_', ' ').charAt(0).toUpperCase() + report.reason.replace('_', ' ').slice(1)}
                        </p>
                        
                        {report.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Description:</span> {report.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Reported by: {report.reportedBy.name}</span>
                          <span>•</span>
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          {report.reviewedAt && (
                            <>
                              <span>•</span>
                              <span>Reviewed: {new Date(report.reviewedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                        
                        {report.adminNotes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">Admin Notes:</span> {report.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4">
                    {report.status === 'pending' && (
                      <button
                        onClick={() => setReviewModal(report)}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </button>
                    )}
                  </div>
                </div>
                
                {report.reportedPhoto && (
                  <div className="mt-4 ml-10">
                    <p className="text-sm font-medium text-gray-700 mb-2">Reported Photo:</p>
                    <img
                      src={report.reportedPhoto.imageUrl}
                      alt="Reported content"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">
              {statusFilter 
                ? `No reports with status "${statusFilter}" found.`
                : "No reports have been submitted yet."
              }
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && <ReviewModal report={reviewModal} />}
    </div>
  );
};