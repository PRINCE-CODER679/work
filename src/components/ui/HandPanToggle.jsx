import { useEffect, useRef, useState } from 'react';

/**
 * Strictly opt-in webcam hand-pan controller for Scene 10.
 * Never requests permissions on load, processes frames solely in local memory,
 * and falls back gracefully if camera access is denied or unavailable.
 */
export function HandPanToggle({ onVector, className = '' }) {
  const [camOn, setCamOn] = useState(false);
  const [camNote, setCamNote] = useState('');
  const streamRef = useRef(null);
  const onVectorRef = useRef(onVector);
  onVectorRef.current = onVector;

  useEffect(() => {
    if (!camOn) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return undefined;
    }

    let cancelled = false;
    let rafId = 0;
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 18;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let prevLuma = null;

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia || !ctx) {
        setCamNote('CAM UNAVAILABLE');
        setCamOn(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 160, height: 120, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();
        setCamNote('LOCAL ONLY');

        let lastSample = 0;
        const tick = (now) => {
          if (cancelled) return;
          if (now - lastSample > 60 && video.readyState >= 2) {
            lastSample = now;
            ctx.drawImage(video, 0, 0, 24, 18);
            const data = ctx.getImageData(0, 0, 24, 18).data;
            let sumW = 0;
            let sumX = 0;
            let sumY = 0;
            const cur = new Float32Array(24 * 18);
            for (let y = 0; y < 18; y++) {
              for (let x = 0; x < 24; x++) {
                const i = y * 24 + x;
                const lum = (data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]) / 3;
                cur[i] = lum;
                if (prevLuma) {
                  const diff = Math.abs(lum - prevLuma[i]);
                  if (diff > 18) {
                    sumW += diff;
                    sumX += (1 - x / 23) * diff;
                    sumY += (y / 17) * diff;
                  }
                }
              }
            }
            prevLuma = cur;
            if (sumW > 140) {
              onVectorRef.current?.(
                Math.min(0.94, Math.max(0.06, sumX / sumW)),
                Math.min(0.9, Math.max(0.1, sumY / sumW)),
                true
              );
            }
          }
          rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
      } catch {
        setCamNote('CAM DENIED — POINTER READY');
        setCamOn(false);
      }
    };

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      onVectorRef.current?.(0.5, 0.5, false);
    };
  }, [camOn]);

  useEffect(() => {
    if (!camNote || camOn) return undefined;
    const t = setTimeout(() => setCamNote(''), 3200);
    return () => clearTimeout(t);
  }, [camNote, camOn]);

  return (
    <button
      type="button"
      className={`${className || 'lab__ctrl-btn'} ${camOn ? 'is-active' : ''}`}
      onClick={() => setCamOn((v) => !v)}
      title="Optional local webcam motion steering — zero data leaves browser"
    >
      {camNote && !camOn ? camNote : `HAND CONTROL: ${camOn ? 'ON' : 'OFF'}`}
    </button>
  );
}

