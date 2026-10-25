import React, { useState, useEffect } from 'react';
import { spaceService } from '../../services/spaceService';
import Loader from '../common/Loader';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { Camera, Calendar, Heart, Eye, Filter } from 'lucide-react';

const ROVERS = [
  { id: 'perseverance', name: 'Perseverance', landed: 'Feb 18, 2021', defaultSol: 1000 },
  { id: 'curiosity', name: 'Curiosity', landed: 'Aug 6, 2012', defaultSol: 3800 },
];

const CAMERAS = [
  { id: 'all', label: 'All Cameras' },
  { id: 'FHAZ', label: 'Front Hazard Avoidance (FHAZ)' },
  { id: 'RHAZ', label: 'Rear Hazard Avoidance (RHAZ)' },
  { id: 'MAST', label: 'Mast Camera (MAST)' },
  { id: 'NAVCAM', label: 'Navigation Camera (NAVCAM)' },
];

const MarsGallery = ({ isPhotoFavorited, onToggleFavorite }) => {
  const [rover, setRover] = useState('perseverance');
  const [sol, setSol] = useState(1000);
  const [camera, setCamera] = useState('all');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const data = await spaceService.getMarsPhotos({
          rover,
          sol,
          camera: camera === 'all' ? undefined : camera,
        });
        setPhotos(data.photos || []);
      } catch (error) {
        console.error('Mars photos error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [rover, sol, camera]);

  return (
    <div className="space-y-6">
      {/* Rover Selection & Controls */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        {/* Rover Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Mars Rover:
          </span>
          {ROVERS.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setRover(r.id);
                setSol(r.defaultSol);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                rover === r.id
                  ? 'bg-cyan-500 text-black shadow-glow-cyan'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
          {/* Sol input */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 whitespace-nowrap">Sol (Martian Day):</span>
            <input
              type="number"
              min="1"
              max="5000"
              value={sol}
              onChange={(e) => setSol(Number(e.target.value))}
              className="w-28 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Camera selector */}
          <div className="flex items-center gap-3">
            <Camera className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <select
              value={camera}
              onChange={(e) => setCamera(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {CAMERAS.map((cam) => (
                <option key={cam.id} value={cam.id} className="bg-slate-900">
                  {cam.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 border border-slate-800">
          <Loader message={`Downlinking Martian surface photos from ${rover.toUpperCase()}...`} />
        </div>
      ) : photos.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 border border-slate-800 text-center text-slate-400 space-y-2">
          <Camera className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">
            No photos downlinked for Sol {sol} with selected camera.
          </p>
          <p className="text-xs text-slate-500">
            Try switching cameras or testing Sol 1000 (Perseverance) or Sol 3800 (Curiosity).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => {
            const isFav = isPhotoFavorited(String(photo.id));

            return (
              <div
                key={photo.id}
                className="group relative rounded-xl overflow-hidden glass-panel border border-slate-800 aspect-square cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.img_src}
                  alt={`Mars Sol ${photo.sol}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500';
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite({
                          itemType: 'mars',
                          itemId: String(photo.id),
                          title: `${photo.rover?.name || 'Mars'} Rover - Sol ${photo.sol} (${photo.camera?.name})`,
                          imageUrl: photo.img_src,
                          description: `Captured by ${photo.camera?.full_name || 'Camera'} on Earth date ${photo.earth_date}.`,
                        });
                      }}
                      className="p-1.5 rounded-lg bg-black/60 text-white hover:text-rose-400 transition"
                      title="Save to Favorites"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  <div className="text-white text-xs">
                    <div className="font-bold">{photo.camera?.name}</div>
                    <div className="text-[10px] text-slate-300">Sol {photo.sol} • {photo.earth_date}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* High-res Detail Modal */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title={
          selectedPhoto
            ? `${selectedPhoto.rover?.name} Rover Camera Image`
            : 'Mars Image'
        }
      >
        {selectedPhoto && (
          <div className="space-y-4">
            <div className="max-h-[60vh] rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedPhoto.img_src}
                alt="Mars Surface"
                className="max-h-[60vh] w-auto object-contain mx-auto"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="glass-panel p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Camera</span>
                <span className="font-semibold text-slate-100">
                  {selectedPhoto.camera?.full_name} ({selectedPhoto.camera?.name})
                </span>
              </div>
              <div className="glass-panel p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Sol (Martian Day)</span>
                <span className="font-semibold text-slate-100">Sol {selectedPhoto.sol}</span>
              </div>
              <div className="glass-panel p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block mb-0.5">Earth Date</span>
                <span className="font-semibold text-slate-100">{selectedPhoto.earth_date}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  onToggleFavorite({
                    itemType: 'mars',
                    itemId: String(selectedPhoto.id),
                    title: `${selectedPhoto.rover?.name} Rover - Sol ${selectedPhoto.sol}`,
                    imageUrl: selectedPhoto.img_src,
                    description: `Captured on Earth date ${selectedPhoto.earth_date} with ${selectedPhoto.camera?.full_name}.`,
                  });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  isPhotoFavorited(String(selectedPhoto.id))
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-cyan-500 text-black hover:bg-cyan-400'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isPhotoFavorited(String(selectedPhoto.id)) ? 'fill-rose-400' : ''
                  }`}
                />
                <span>
                  {isPhotoFavorited(String(selectedPhoto.id))
                    ? 'Saved in Favorites'
                    : 'Save to Favorites'}
                </span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MarsGallery;
