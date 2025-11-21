import React from 'react';
import { cn } from '@/lib/utils';

interface AionAiAnimatedLogoProps extends React.ComponentProps<'div'> {}

const AionAiAnimatedLogo = (props: AionAiAnimatedLogoProps) => {
  return (
    <div
      {...props}
      className={cn(
        'overflow-hidden rounded-full select-none pointer-events-none',
        props.className,
      )}
    >
      <video
        src="/videos/AiON.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default AionAiAnimatedLogo;
