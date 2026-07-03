import { useMemo } from 'react';

interface ConfettiProps {
  active: boolean;
}

const colors = ['#C8FF2E', '#FFFFFF', '#FF5A36'];

export function Confetti({ active }: ConfettiProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        left: 10 + Math.random() * 80,
        delay: Math.random() * 120,
        rotation: Math.random() * 220 - 110,
        color: colors[index % colors.length]
      })),
    []
  );

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute top-[18%] h-3 w-2 rounded-[2px]"
          style={{
            left: `${piece.left}%`,
            background: piece.color,
            animation: `confettiFall 900ms ${piece.delay}ms cubic-bezier(.18,.8,.28,1) forwards`,
            transform: `rotate(${piece.rotation}deg)`
          }}
        />
      ))}
    </div>
  );
}
