import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Users, Globe } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface LeaderboardUser {
  _id: string;
  name: string;
  profilePicture?: string;
  score: number;
  followers: number;
  college: string;
}

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'college' | 'global'>('college');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const endpoint = activeTab === 'college' ? '/users/leaderboard/college' : '/users/leaderboard/global';
      const response = await api.get(endpoint);
      
      if (response.success) {
        setLeaderboard(response.leaderboard);
      } else {
        toast.error('Failed to load leaderboard');
      }
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">{rank}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
          <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
          
          {/* Tab Navigation */}
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('college')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                activeTab === 'college'
                  ? 'bg-white text-blue-600'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>My College</span>
            </button>
            <button
              onClick={() => setActiveTab('global')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                activeTab === 'global'
                  ? 'bg-white text-blue-600'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Global</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-4">
              {leaderboard.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-colors duration-200 hover:bg-gray-50 ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-white border border-gray-200'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center border-2 border-gray-200">
                        <span className="text-white font-semibold">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{user.college}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex-shrink-0 text-right">
                    <div className="font-bold text-gray-900">{user.score} points</div>
                    <div className="text-sm text-gray-600">{user.followers} followers</div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No rankings yet</h3>
              <p className="text-gray-600">
                {activeTab === 'college' 
                  ? "Be the first to get on your college leaderboard!"
                  : "Check back later for global rankings!"
                }
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* How scoring works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-blue-50 rounded-xl p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-3">How Scoring Works</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Each like on your photo = 2 points</li>
          <li>• Each reaction (😍🔥😊👍✨) = 1.5 points</li>
          <li>• Followers count toward your overall ranking</li>
          <li>• Rankings update in real-time as you receive interactions</li>
        </ul>
      </motion.div>
    </div>
  );
};