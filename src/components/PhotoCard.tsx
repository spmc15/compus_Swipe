import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, X, Smile, Flame, Sparkles, ThumbsUp } from 'lucide-react';
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

interface PhotoCardProps {
  photo: Photo;
  onSwipe: (direction: 'like' | 'skip', reaction?: string) => Promise<void>;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onSwipe }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swiped right - like
      setShowReactions(true);
      return;
    } else if (info.offset.x < -threshold) {
      // Swiped left - skip
      try {
        await onSwipe('skip');
        toast.success('Photo skipped');
      } catch (error) {
        toast.error('Failed to skip photo');
      }
    }
    
    // Reset position if threshold not met
    x.set(0);
  };

  const handleReactionSelect = async (reaction: string) => {
    setShowReactions(false);
    try {
      await onSwipe('like', reaction);
      toast.success('Photo liked!');
    } catch (error) {
      toast.error('Failed to like photo');
    }
  };

  const reactions = [
    { key: 'love', icon: Heart, color: 'text-red-500', label: '😍' },
    { key: 'fire', icon: Flame, color: 'text-orange-500', label: '🔥' },
    { key: 'smile', icon: Smile, color: 'text-yellow-500', label: '😊' },
    { key: 'thumbsUp', icon: ThumbsUp, color: 'text-blue-500', label: '👍' },
    { key: 'sparkles', icon: Sparkles, color: 'text-purple-500', label: '✨' }
  ];

  return (
    <>
      <motion.div
        className="relative w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.95 }}
      >
        {/* Swipe indicators */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <motion.div
            className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg"
            style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
          >
            LIKE
          </motion.div>
          <motion.div
            className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg"
            style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
          >
            SKIP
          </motion.div>
        </div>

        {/* Photo */}
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={photo.imageUrl}
            alt={`Photo by ${photo.user.name}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* User info */}
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            {photo.user.profilePicture ? (
              <img
                src={photo.user.profilePicture}
                alt={photo.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {photo.user.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{photo.user.name}</h3>
              <p className="text-sm text-gray-500">{photo.user.college}</p>
            </div>
          </div>

          {photo.caption && (
            <p className="text-gray-700 mb-3">{photo.caption}</p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{photo.likes} likes</span>
            <div className="flex space-x-2">
              {reactions.map(({ label, key }) => (
                <span key={key}>
                  {label} {photo.reactions[key as keyof typeof photo.reactions]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center space-x-4 p-4 border-t border-gray-100">
          <button
            onClick={() => onSwipe('skip')}
            className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={() => setShowReactions(true)}
            className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200"
          >
            <Heart className="w-6 h-6 text-white" />
          </button>
        </div>
      </motion.div>

      {/* Reactions Modal */}
      {showReactions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowReactions(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-center mb-4">React to this photo</h3>
            <div className="grid grid-cols-5 gap-3">
              {reactions.map(({ key, icon: Icon, color, label }) => (
                <button
                  key={key}
                  onClick={() => handleReactionSelect(key)}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className={`text-2xl mb-1`}>{label}</div>
                  <Icon className={`w-4 h-4 ${color}`} />
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowReactions(false)}
              className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};