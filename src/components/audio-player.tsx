import { useEffect, useRef, useState } from 'react';
import { PauseIcon, PlayIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useStorageState } from '@/core/hooks/use-storage-state';
import { displayDuration } from '@/core/display-duration';

const STORAGE = 'https://storage.yandexcloud.net';

interface AudioPlayerProps {
  id: string;
  path: string;
  duration: number;
}

export function AudioPlayer({ id, path, duration }: AudioPlayerProps) {
  const src = `${STORAGE}${path.replace('/mds/', '/mds-mp3/')}`;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useStorageState(`progress-for-${id}`, 0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const player = audioRef.current!;
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

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      player.currentTime = 0;
    });
  }, []);

  function togglePlay() {
    const player = audioRef.current;
    if (!player) {
      return;
    }

    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  }

  function handleTimeUpdate() {
    const player = audioRef.current!;

    const progress = (player.currentTime / player.duration) * 100;
    setProgress(progress);
    setCurrentTime(player.currentTime);
  }

  function handleSliderChange([newProgress]: [number]) {
    if (audioRef.current) {
      const time = newProgress === 0 ? 0 : (newProgress / 100) * audioRef.current.duration;
      if (!isFinite(time) || isNaN(time)) {
        return;
      }
      audioRef.current.currentTime = time;
      setProgress(newProgress);
    }
  }

  return (
    <div className='flex min-w-[200px] items-center gap-4'>
      <Button
        variant='outline'
        size='icon'
        className='h-8 w-8 shrink-0 rounded-full hover:bg-primary hover:text-primary-foreground dark:border-secondary dark:bg-secondary/90 dark:hover:bg-secondary/60'
        onClick={togglePlay}
        aria-label={isPlaying ? 'Остановить' : 'Играть'}
      >
        {isPlaying ? <PauseIcon className='h-4 w-4' /> : <PlayIcon className='h-4 w-4' />}
      </Button>
      <div className='flex w-[300px] items-center gap-2'>
        <span className='min-w-[90px] text-center text-sm text-muted-foreground'>{displayDuration(currentTime)}</span>
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          className='w-[200px] [&_[role=slider]]:border-primary [&_[role=slider]]:bg-primary [&>span:first-child]:bg-primary/20 dark:[&>span:first-child]:bg-primary/40 [&>span:first-child_span]:bg-primary'
          onValueChange={handleSliderChange}
          aria-label='Прогресс воспроизведения'
        />
        <span className='min-w-[90px] text-center text-sm text-muted-foreground'>{displayDuration(duration)}</span>
      </div>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </div>
  );
}
