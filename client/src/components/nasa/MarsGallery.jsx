import React, { useState, useEffect } from 'react';
import { spaceService } from '../../services/spaceService';
import Input from '../common/Input';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import ImageViewer from './ImageViewer';
import LazyImage from './LazyImage';
import SaveToggle from './SaveToggle';
import { Bookmark, BookmarkCheck, Maximize2 } from 'lucide-react';

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

// Rhythm of frame proportions so the masonry reads as an edited spread, not a uniform grid
const FRAME_RATIOS = ['aspect-[4/5]', 'aspect-[4/3]', 'aspect-square', 'aspect-[3/4]', 'aspect-[16/10]', 'aspect-[4/3]'];

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

  const activeRover = ROVERS.find((r) => r.id === rover);

  return (
    <div className="space-y-10">
      {/* Filters: rover / sol / camera */}
      <div className="grid grid-cols-12 gap-x-6 gap-y-6 items-end border-b border-line pb-6">
        <div className="col-span-12 lg:col-span-5">
          <span className="label block mb-2" id="rover-label">
            Rover
          </span>
          <div className="flex border border-line-strong w-full sm:w-max" role="group" aria-labelledby="rover-label">
            {ROVERS.map((r) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={rover === r.id}
                onClick={() => {
                  setRover(r.id);
                  setSol(r.defaultSol);
                }}
                className={`flex-1 sm:flex-none h-10 px-5 font-mono text-[0.6875rem] uppercase tracking-label transition-colors border-r border-line-strong last:border-r-0 ${
                  rover === r.id ? 'bg-fg text-black' : 'text-fg-muted hover:text-fg'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-5 sm:col-span-4 lg:col-span-2">
          <Input
            label="Sol (Martian day)"
            type="number"
            min="1"
            max="5000"
            value={sol}
            onChange={(e) => setSol(Number(e.target.value))}
            inputClassName="telemetry"
          />
        </div>

        <div className="col-span-7 sm:col-span-8 lg:col-span-5">
          <Input as="select" label="Camera" value={camera} onChange={(e) => setCamera(e.target.value)}>
            {CAMERAS.map((cam) => (
              <option key={cam.id} value={cam.id}>
                {cam.label}
              </option>
            ))}
          </Input>
        </div>

        <p className="col-span-12 font-mono text-[0.6875rem] text-fg-muted flex flex-wrap gap-x-6 gap-y-1">
          <span>
            <span className="text-fg-faint">ROVER</span> {activeRover?.name.toUpperCase()}
          </span>
          <span>
            <span className="text-fg-faint">LANDED</span> {activeRover?.landed.toUpperCase()}
          </span>
          <span>
            <span className="text-fg-faint">FRAMES</span> {loading ? '—' : String(photos.length).padStart(3, '0')}
          </span>
        </p>
      </div>

      {/* Masonry */}
      {loading ? (
        <div className="columns-2 md:columns-3 xl:columns-4 gap-4" role="status" aria-label={`Downlinking Martian surface photos from ${rover}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="mb-4 break-inside-avoid space-y-2">
              <Skeleton className={`w-full ${FRAME_RATIOS[i % FRAME_RATIOS.length]}`} />
              <Skeleton className="h-2.5 w-2/3" />
            </div>
          ))}
        </div>
      ) : photos.length === 0 ? (
        <EmptyState
          code={`SOL ${sol} · NO DOWNLINK`}
          title={`No photos downlinked for Sol ${sol} with selected camera.`}
          description="Try switching cameras or testing Sol 1000 (Perseverance) or Sol 3800 (Curiosity)."
        />
      ) : (
        <div className="columns-2 md:columns-3 xl:columns-4 gap-4">
          {photos.map((photo, i) => {
            const isFav = isPhotoFavorited(String(photo.id));
            const FavIcon = isFav ? BookmarkCheck : Bookmark;

            return (
              <figure key={photo.id} className="group relative mb-4 break-inside-avoid">
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  aria-label={`Open Sol ${photo.sol} ${photo.camera?.name || ''} frame`}
                  className="block w-full border border-line hover:border-line-bright transition-colors"
                >
                  <LazyImage
                    src={photo.img_src}
                    alt={`Mars Sol ${photo.sol}`}
                    wrapperClassName={`w-full ${FRAME_RATIOS[i % FRAME_RATIOS.length]}`}
                    className="w-full h-full object-cover group-hover:scale-[1.03]"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500';
                    }}
                  />
                </button>

                <button
                  type="button"
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
                  aria-pressed={isFav}
                  aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
                  title="Save to Favorites"
                  className={`absolute top-2 right-2 h-8 w-8 flex items-center justify-center border transition-[opacity,colors] duration-200 ${
                    isFav
                      ? 'opacity-100 btn-gradient rounded-btn'
                      : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 bg-ink/80 border-line-bright text-fg hover:border-fg-muted'
                  }`}
                >
                  <FavIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>

                <figcaption className="mt-2 flex items-baseline justify-between gap-3 font-mono text-[0.625rem] uppercase tracking-label">
                  <span className="text-fg">
                    <span className="text-fg-faint">SOL</span> {photo.sol} · {photo.camera?.name}
                  </span>
                  <span className="text-fg-muted">{photo.earth_date}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}

      {/* Full-screen viewer (same selectedPhoto state as the original modal) */}
      <ImageViewer
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        src={selectedPhoto?.img_src}
        alt="Mars Surface"
        kicker={selectedPhoto ? `${selectedPhoto.rover?.name} · Sol ${selectedPhoto.sol}` : 'Mars'}
        title={selectedPhoto ? `${selectedPhoto.rover?.name} Rover Camera Image` : 'Mars Image'}
        meta={
          selectedPhoto
            ? [
                { label: 'Rover', value: selectedPhoto.rover?.name },
                { label: 'Camera', value: `${selectedPhoto.camera?.full_name} (${selectedPhoto.camera?.name})` },
                { label: 'Sol', value: `Sol ${selectedPhoto.sol}` },
                { label: 'Earth date', value: selectedPhoto.earth_date },
                { label: 'Frame ID', value: selectedPhoto.id },
              ]
            : []
        }
        actions={
          selectedPhoto && (
            <>
              <SaveToggle
                saved={isPhotoFavorited(String(selectedPhoto.id))}
                savedLabel="Saved in favorites"
                label="Save to favorites"
                onClick={() => {
                  onToggleFavorite({
                    itemType: 'mars',
                    itemId: String(selectedPhoto.id),
                    title: `${selectedPhoto.rover?.name} Rover - Sol ${selectedPhoto.sol}`,
                    imageUrl: selectedPhoto.img_src,
                    description: `Captured on Earth date ${selectedPhoto.earth_date} with ${selectedPhoto.camera?.full_name}.`,
                  });
                }}
              />
              <a
                href={selectedPhoto.img_src}
                target="_blank"
                rel="noreferrer"
                className="link-sweep inline-flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-label text-fg hover:text-signal"
              >
                Original <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </>
          )
        }
      />
    </div>
  );
};

export default MarsGallery;
