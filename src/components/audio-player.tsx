import { useEffect, useRef, useState } from 'react';
import { PauseIcon, PlayIcon, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useStorageState } from '@/core/hooks/use-storage-state';
import { displayDuration } from '@/core/display-duration';
import { returnIfDefined } from '@/core/defined';

const STORAGE = 'https://mds-old.ru';

interface AudioPlayerProps {
  id: string;
  path: string;
  duration: number;
  autoPlay: boolean;
  onEnded?: () => void;
}

export function AudioPlayer({ id, path, duration: initialDuration, autoPlay, onEnded }: AudioPlayerProps) {
  const src = `${STORAGE}${path.replace('/mds/', '/mp3/')}`;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useStorageState(`time-for-${id}`, 0);
  const [duration, setDuration] = useState(initialDuration);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const player = returnIfDefined(audioRef.current);
    if (!('mediaSession' in navigator)) {
      return;
    }

    navigator.mediaSession.setActionHandler('play', () => player.play());
    navigator.mediaSession.setActionHandler('pause', () => player.pause());
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skipTime = details.seekOffset || 1;
      player.currentTime = Math.max(player.currentTime - skipTime, 0);
    });

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skipTime = details.seekOffset || 1;
      player.currentTime = Math.min(player.currentTime + skipTime, player.duration);
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (!details.seekTime) {
        return;
      }
      if (details.fastSeek && 'fastSeek' in player) {
        player.fastSeek(details.seekTime);
        return;
      }
      player.currentTime = details.seekTime;
    });
  }, []);

  function handleMetadataLoaded() {
    const player = returnIfDefined(audioRef.current);
    setDuration(player.duration);

    if (currentTime > 0) {
      player.currentTime = Math.min(currentTime, player.duration);
    }
  }

  function togglePlay() {
    const player = returnIfDefined(audioRef.current);

    if (isPlaying) {
      player.pause();
    } else {
      setIsLoading(true);
      player.play().catch(() => {
        setIsLoading(false);
      });
    }
  }

  function handleTimeUpdate() {
    const player = returnIfDefined(audioRef.current);
    setCurrentTime(player.currentTime);
  }

  function handleSliderChange([newProgress]: [number]) {
    if (audioRef.current) {
      const time = (newProgress / 100) * duration;
      if (!isFinite(time) || isNaN(time)) {
        return;
      }
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }

  function handleAudioEnded() {
    setIsPlaying(false);
    setCurrentTime(0);
    onEnded?.();
  }

  return (
    <div className='flex w-full items-center gap-4'>
      <Button
        variant='outline'
        size='icon'
        className='h-12 w-12 shrink-0 rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg dark:border-secondary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/80'
        onClick={togglePlay}
        disabled={isLoading}
        aria-label={isPlaying ? 'Остановить' : 'Играть'}
      >
        {isLoading ? (
          <Loader2Icon className='h-6 w-6 animate-spin' />
        ) : isPlaying ? (
          <PauseIcon className='h-6 w-6' />
        ) : (
          <PlayIcon className='h-6 w-6' />
        )}
      </Button>
      <div className='flex flex-1 items-center gap-2'>
        <span className='w-[70px] text-center text-sm text-muted-foreground sm:w-[90px]'>
          {displayDuration(currentTime)}
        </span>
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          className='flex-1 [&_[role=slider]]:border-primary [&_[role=slider]]:bg-primary [&>span:first-child]:bg-primary/20 dark:[&>span:first-child]:bg-primary/40 [&>span:first-child_span]:bg-primary'
          onValueChange={handleSliderChange}
          aria-label='Прогресс воспроизведения'
        />
        <span className='w-[70px] text-center text-sm text-muted-foreground sm:w-[90px]'>
          {displayDuration(duration)}
        </span>
      </div>
      <audio
        ref={audioRef}
        src={src}
        autoPlay={autoPlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => {
          setIsPlaying(true);
          setIsLoading(false);
        }}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onLoadedMetadata={handleMetadataLoaded}
      />
    </div>
  );
}
