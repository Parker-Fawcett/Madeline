"use client";

import { useRef, useState, useCallback } from "react";

const MAX_RADIUS = 45;

export interface JoystickVector {
  x: number;
  y: number;
}

export function Joystick({
  vectorRef,
}: {
  vectorRef: React.MutableRefObject<JoystickVector>;
}) {
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [nub, setNub] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const activePointerId = useRef<number | null>(null);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number, baseX: number, baseY: number) => {
      let dx = clientX - baseX;
      let dy = clientY - baseY;
      const dist = Math.hypot(dx, dy);
      if (dist > MAX_RADIUS) {
        dx = (dx / dist) * MAX_RADIUS;
        dy = (dy / dist) * MAX_RADIUS;
      }
      setNub({ x: dx, y: dy });
      vectorRef.current.x = dx / MAX_RADIUS;
      vectorRef.current.y = -dy / MAX_RADIUS;
    },
    [vectorRef]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== null) return;
    activePointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setOrigin({ x: e.clientX, y: e.clientY });
    setNub({ x: 0, y: 0 });
    vectorRef.current.x = 0;
    vectorRef.current.y = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId || !origin) return;
    updateFromPointer(e.clientX, e.clientY, origin.x, origin.y);
  };

  const endTouch = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    activePointerId.current = null;
    setOrigin(null);
    setNub({ x: 0, y: 0 });
    vectorRef.current.x = 0;
    vectorRef.current.y = 0;
  };

  return (
    <div
      className="fixed bottom-0 left-0 z-40"
      style={{ width: "45vw", height: "40vh", touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endTouch}
      onPointerCancel={endTouch}
    >
      {origin && (
        <>
          <div
            className="pointer-events-none fixed rounded-full border-2 border-white/40 bg-white/10"
            style={{
              width: 100,
              height: 100,
              left: origin.x - 50,
              top: origin.y - 50,
            }}
          />
          <div
            className="pointer-events-none fixed rounded-full bg-white/50"
            style={{
              width: 50,
              height: 50,
              left: origin.x - 25 + nub.x,
              top: origin.y - 25 + nub.y,
            }}
          />
        </>
      )}
    </div>
  );
}
