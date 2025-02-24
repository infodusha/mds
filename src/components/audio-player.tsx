import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  src: string;
}

export function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleSliderChange = (value: [number]) => {
    if (audioRef.current) {
      const time = (value[0] / 100) * audioRef.current.duration;
      audioRef.current.currentTime = time;
      setProgress(value[0]);
    }
  };

  return (
    <div className='flex min-w-[200px] items-center gap-4'>
      <Button
        variant='outline'
        size='icon'
        className='h-8 w-8 shrink-0 rounded-full hover:bg-primary hover:text-primary-foreground dark:border-secondary dark:bg-secondary/90 dark:hover:bg-secondary/60'
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause className='h-4 w-4' /> : <Play className='h-4 w-4' />}
      </Button>
      <Slider
        value={[progress]}
        max={100}
        step={0.1}
        className='w-[200px] [&_[role=slider]]:border-primary [&_[role=slider]]:bg-primary [&>span:first-child]:bg-primary/20 dark:[&>span:first-child]:bg-primary/40 [&>span:first-child_span]:bg-primary'
        onValueChange={handleSliderChange}
        aria-label='Playback progress'
      />
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} />
    </div>
  );
}
