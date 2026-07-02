import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedNumber({ value, suffix = '', prefix = '', decimals = 0, duration = 1500 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = parseFloat(value) || 0;
    prevValue.current = end;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(decimals > 0 ? current.toFixed(decimals) : Math.round(current));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration, decimals]);

  return (
    <span>{prefix}{display}{suffix}</span>
  );
}
