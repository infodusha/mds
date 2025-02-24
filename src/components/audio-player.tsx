import { useRef, useState } from 'react';
import { PauseIcon, PlayIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useStorageState } from '@/core/hooks/use-storage-state';

const STORAGE = 'https://storage.yandexcloud.net';

interface AudioPlayerProps {
  id: string;
  path: string;
}

export function AudioPlayer({ id, path }: AudioPlayerProps) {
  const src = `${STORAGE}${path.replace('/mds/', '/mds-mp3/')}`;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useStorageState(`progress-for-${id}`, 0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleSliderChange = ([newProgress]: [number]) => {
    if (audioRef.current) {
      const time = newProgress === 0 ? 0 : (newProgress / 100) * audioRef.current.duration;
      if (!isFinite(time) || isNaN(time)) {
        return;
      }
      audioRef.current.currentTime = time;
      setProgress(newProgress);
    }
  };

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
      <Slider
        value={[progress]}
        max={100}
        step={0.1}
        className='w-[200px] [&_[role=slider]]:border-primary [&_[role=slider]]:bg-primary [&>span:first-child]:bg-primary/20 dark:[&>span:first-child]:bg-primary/40 [&>span:first-child_span]:bg-primary'
        onValueChange={handleSliderChange}
        aria-label='Прогресс воспроизведения'
      />
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} />
    </div>
  );
}
