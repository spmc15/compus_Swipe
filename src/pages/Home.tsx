import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { PhotoCard } from '../components/PhotoCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Photo {
  _id: string;
  imageUrl: string;
  caption: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
    college: string;
  };
  likes: number;
  reactions: {
    love: number;
    fire: number;
    smile: number;
    thumbsUp: number;
    sparkles: number;
  };
}

export const Home: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await api.get('/photos/feed', { 
        page: 1, 
        limit: 20 
      });

      if (response.success) {
        setPhotos(response.photos);
        setCurrentPhotoIndex(0);
      } else {
        toast.error('Failed to load photos');
      }
    } catch (error) {
      toast.error('Failed to load photos');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSwipe = async (direction: 'like' | 'skip', reaction?: string) => {
    const currentPhoto = photos[currentPhotoIndex];
    
    try {
      await api.post(`/photos/${currentPhoto._id}/swipe`, {
        direction,
        reaction
      });

      // Move to next photo
      setCurrentPhotoIndex(prev => prev + 1);

      // Load more photos if running low
      if (currentPhotoIndex >= photos.length - 3) {
        fetchMorePhotos();
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to process swipe');
    }
  };

  const fetchMorePhotos = async () => {
    try {
      const response = await api.get('/photos/feed', { 
        page: Math.ceil(photos.length / 20) + 1, 
        limit: 20 
      });

      if (response.success && response.photos.length > 0) {
        setPhotos(prev => [...prev, ...response.photos]);
      }
    } catch (error) {
      console.error('Failed to load more photos:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentPhoto = photos[currentPhotoIndex];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        <button
          onClick={() => fetchPhotos(true)}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {currentPhoto ? (
        <div className="relative">
          <PhotoCard 
            photo={currentPhoto} 
            onSwipe={handleSwipe}
          />
          
          {/* Next photo preview */}
          {photos[currentPhotoIndex + 1] && (
            <div className="absolute inset-0 -z-10 scale-95 opacity-30">
              <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="aspect-[3/4]">
                  <img
                    src={photos[currentPhotoIndex + 1].imageUrl}
                    alt="Next photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-gray-500">
            <p>{photos.length - currentPhotoIndex} photos remaining</p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all caught up!</h2>
          <p className="text-gray-600 mb-6">
            No more photos to swipe. Check back later for new content!
          </p>
          <button
            onClick={() => fetchPhotos(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
          >
            Refresh Feed
          </button>
        </motion.div>
      )}

      {/* Swipe instructions for first-time users */}
      {currentPhotoIndex === 0 && currentPhoto && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-6 bg-blue-50 rounded-lg p-4 text-center"
        >
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Swipe right</span> to like or{' '}
            <span className="font-semibold">swipe left</span> to skip
          </p>
        </motion.div>
      )}
    </div>
  );
};