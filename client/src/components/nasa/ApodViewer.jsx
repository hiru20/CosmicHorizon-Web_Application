import React, { useState, useEffect } from 'react';
import { spaceService } from '../../services/spaceService';
import { useNotification } from '../../context/NotificationContext';
import Input from '../common/Input';
import Button from '../common/Button';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import ImageViewer from './ImageViewer';
import LazyImage from './LazyImage';
import SaveToggle from './SaveToggle';
import { Maximize2, ExternalLink, Shuffle } from 'lucide-react';

const ApodViewer = ({ isFavorited, onToggleFavorite }) => {
  const { notifyError, notifyInfo } = useNotification();

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

  const handleFavorite = () =>
    onToggleFavorite({
      itemType: 'apod',
      itemId: apod.date,
      title: apod.title,
      imageUrl: apod.url,
      description: apod.explanation,
    });

  return (
    <div className="space-y-10">
      {/* Observation controls */}
      <div className="grid grid-cols-12 gap-x-6 gap-y-4 items-end border-b border-line pb-6">
        <div className="col-span-12 sm:col-span-5 lg:col-span-3">
          <Input
            label="Observation date"
            type="date"
            value={date}
            max={new Date().toISOString().split('T')[0]}
            min="1995-06-16"
            onChange={(e) => setDate(e.target.value)}
            inputClassName="telemetry"
          />
        </div>
        <div className="col-span-12 sm:col-span-7 lg:col-span-9 flex flex-wrap items-center gap-2 sm:justify-end">
          <span className="hidden lg:inline label text-fg-faint mr-auto">Archive window 1995.06.16 — today</span>
          <Button variant="secondary" size="sm" onClick={() => setDate(new Date().toISOString().split('T')[0])}>
            Today
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Shuffle}
            onClick={handleSurpriseMe}
            title="Discover a random historical Astronomy Picture of the Day"
          >
            Random date
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-12 gap-6" role="status" aria-label="Loading picture of the day">
          <Skeleton className="col-span-12 lg:col-span-8 aspect-[16/10]" />
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        </div>
      ) : !apod ? (
        <EmptyState code="NO DATA · APOD" title="Nothing was published for this date." description="Pick another observation date or jump to a random entry in the archive." />
      ) : (
        <article className="grid grid-cols-12 gap-x-6 gap-y-8">
          {/* Full-bleed media with mono caption overlay */}
          <figure className="group col-span-12 lg:col-span-8 relative border border-line bg-ink crosshairs">
            {apod.media_type === 'video' ? (
              <iframe src={apod.url} title={apod.title} className="w-full aspect-video border-0" allowFullScreen />
            ) : (
              <>
                <LazyImage
                  src={apod.url}
                  alt={apod.title}
                  wrapperClassName="w-full"
                  className="w-full max-h-[78vh] object-cover group-hover:scale-[1.015]"
                />
                <button
                  type="button"
                  onClick={() => setShowHdModal(true)}
                  aria-label="Open full-screen viewer"
                  className="absolute top-3 right-3 h-9 px-3 flex items-center gap-2 bg-ink/80 border border-line-strong label text-fg hover:border-fg-muted"
                >
                  <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                  <span>View</span>
                </button>
              </>
            )}
            <figcaption className="absolute left-0 bottom-0 max-w-full bg-ink/85 border-t border-r border-line px-4 py-3 font-mono text-[0.6875rem] uppercase tracking-label text-fg-muted flex flex-wrap gap-x-4 gap-y-1">
              <span className="text-signal">{apod.date}</span>
              <span className="text-fg truncate max-w-[22rem]">{apod.title}</span>
              {apod.copyright && <span className="truncate max-w-[16rem]">© {apod.copyright}</span>}
            </figcaption>
          </figure>

          {/* Editorial column */}
          <div className="col-span-12 lg:col-span-4 flex flex-col">
            <span className="label text-fg-faint">Astronomy picture of the day</span>
            <h2 className="mt-3 font-display text-display-sm text-fg">{apod.title}</h2>
            <p className="mt-6 text-[0.95rem] text-fg-muted leading-[1.75] lg:max-h-[24rem] lg:overflow-y-auto lg:pr-3 first-letter:font-display first-letter:text-5xl first-letter:leading-[0.8] first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-fg">
              {apod.explanation}
            </p>

            <dl className="mt-8 border-t border-line divide-y divide-line">
              <div className="grid grid-cols-[6rem_1fr] py-2.5">
                <dt className="label text-fg-faint">Date</dt>
                <dd className="telemetry text-xs text-fg">{apod.date}</dd>
              </div>
              <div className="grid grid-cols-[6rem_1fr] py-2.5">
                <dt className="label text-fg-faint">Media</dt>
                <dd className="font-mono text-xs uppercase text-fg">{apod.media_type || 'image'}</dd>
              </div>
              <div className="grid grid-cols-[6rem_1fr] py-2.5">
                <dt className="label text-fg-faint">Credit</dt>
                <dd className="font-mono text-xs text-fg">{apod.copyright || 'NASA / Public domain'}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <SaveToggle saved={isFavorited} onClick={handleFavorite} savedLabel="Saved to favorites" label="Save to favorites" />
              {apod.hdurl && (
                <Button variant="link" onClick={() => setShowHdModal(true)} iconRight={Maximize2}>
                  Full HD
                </Button>
              )}
            </div>
          </div>
        </article>
      )}

      {/* Full-screen viewer (same open state as the original HD modal) */}
      <ImageViewer
        isOpen={showHdModal}
        onClose={() => setShowHdModal(false)}
        src={apod?.hdurl || apod?.url}
        alt={apod?.title}
        kicker={`APOD — ${apod?.date || ''}`}
        title={apod?.title || 'HD Astronomy Photograph'}
        meta={[
          { label: 'Date', value: apod?.date },
          { label: 'Credit', value: apod?.copyright || 'NASA / Public domain' },
          { label: 'Resolution', value: apod?.hdurl ? 'HD original' : 'Standard' },
        ]}
        actions={
          <>
            {apod && <SaveToggle saved={isFavorited} onClick={handleFavorite} savedLabel="Saved" label="Save" size="sm" />}
            <a
              href={apod?.hdurl || apod?.url}
              target="_blank"
              rel="noreferrer"
              className="link-sweep inline-flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-label text-fg hover:text-signal"
            >
              Open original file <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </>
        }
      />
    </div>
  );
};

export default ApodViewer;
