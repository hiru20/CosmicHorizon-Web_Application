import React, { useState, useEffect } from 'react';
import { spaceService } from '../../services/spaceService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../common/Loader';
import Modal from '../common/Modal';
import { Calendar, Heart, Maximize2, Share2, Sparkles, ExternalLink, Shuffle } from 'lucide-react';

const ApodViewer = ({ isFavorited, onToggleFavorite }) => {
  const { isAuthenticated } = useAuth();
  const { notifySuccess, notifyError, notifyInfo } = useNotification();

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHdModal, setShowHdModal] = useState(false);

  // Generate a random date between 1995-06-16 (APOD launch) and today
  const handleSurpriseMe = () => {
    const start = new Date('1995-06-16').getTime();
    const end = Date.now();
    const randomTime = start + Math.floor(Math.random() * (end - start));
    const randomDate = new Date(randomTime).toISOString().split('T')[0];
    setDate(randomDate);
    notifyInfo(`Surprise Discovery! Jumping to ${randomDate}...`);
  };

  useEffect(() => {
    const fetchApod = async () => {
      setLoading(true);
      try {
        const data = await spaceService.getApod(date);
        setApod(data);
      } catch (error) {
        console.error('APOD error:', error);
        notifyError('Could not load Astronomy Picture of the Day');
      } finally {
        setLoading(false);
      }
    };

    fetchApod();
  }, [date, notifyError]);

  return (
    <div className="space-y-6">
      {/* Date selector toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold text-sm text-slate-100">
            Select Observation Date:
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              min="1995-06-16"
              onChange={(e) => setDate(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
            />
          </div>
          <button
            onClick={() => setDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Today
          </button>
          <button
            onClick={handleSurpriseMe}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-glow-cyan hover:opacity-95 transition"
            title="Discover a random historical Astronomy Picture of the Day"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Surprise Me</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel rounded-2xl p-12 border border-slate-800">
          <Loader message="Receiving high-resolution astronomical telemetry..." />
        </div>
      ) : !apod ? (
        <div className="glass-panel rounded-2xl p-12 border border-slate-800 text-center text-slate-400">
          No astronomical data found for this date.
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Media presentation (Left 7 cols) */}
            <div className="lg:col-span-7 relative bg-black flex items-center justify-center min-h-[380px] max-h-[600px] overflow-hidden group">
              {apod.media_type === 'video' ? (
                <iframe
                  src={apod.url}
                  title={apod.title}
                  className="w-full h-full min-h-[400px] border-0"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    src={apod.url}
                    alt={apod.title}
                    className="w-full h-full object-cover max-h-[580px] transition-transform duration-700 group-hover:scale-105"
                  />
                  <button
                    onClick={() => setShowHdModal(true)}
                    className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/60 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/90 shadow-xl"
                    title="View Full HD"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Description & Metadata (Right 5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {apod.date}
                  </span>
                  {apod.copyright && (
                    <span className="truncate max-w-[180px]">
                      Credit: {apod.copyright}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight leading-snug">
                  {apod.title}
                </h2>

                <div className="max-h-[300px] overflow-y-auto pr-2">
                  <p className="text-sm text-slate-300 leading-relaxed font-normal">
                    {apod.explanation}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => onToggleFavorite({
                    itemType: 'apod',
                    itemId: apod.date,
                    title: apod.title,
                    imageUrl: apod.url,
                    description: apod.explanation,
                  })}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isFavorited
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isFavorited ? 'fill-rose-400 text-rose-400' : ''}`}
                  />
                  <span>{isFavorited ? 'Saved to Favorites' : 'Add to Favorites'}</span>
                </button>

                {apod.hdurl && (
                  <button
                    onClick={() => setShowHdModal(true)}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition"
                  >
                    <span>Full HD</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HD Modal */}
      <Modal
        isOpen={showHdModal}
        onClose={() => setShowHdModal(false)}
        title={apod?.title || 'HD Astronomy Photograph'}
        maxWidth="max-w-5xl"
      >
        <div className="space-y-4">
          <div className="max-h-[70vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
            <img
              src={apod?.hdurl || apod?.url}
              alt={apod?.title}
              className="max-h-[70vh] w-auto object-contain mx-auto"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Astronomy Picture of the Day — {apod?.date}</span>
            <a
              href={apod?.hdurl || apod?.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-cyan-400 hover:underline"
            >
              Open original file <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApodViewer;
