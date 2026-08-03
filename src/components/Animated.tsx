import React from 'react';
import { useIntersectionFade } from '../hooks/useIntersectionFade';

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function Animated({ children, className = '', style }: Props) {
  const { ref, inView } = useIntersectionFade<HTMLDivElement>({ threshold: 0.12 });
  return (
    <div ref={ref as any} className={`animated-section ${inView ? 'in-view' : ''} ${className}`} style={style}>
      {children}
    </div>
  );
}

export default Animated;
