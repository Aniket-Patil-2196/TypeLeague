import React, { useState, useEffect, useRef } from 'react';
import { CropMarkBox } from '../ui/CropMarkBox';
import { RotateCcw } from 'lucide-react';

const SAMPLE_PASSAGE = "The interface must look like it was designed by a human product designer with a strong point of view. A light warm-grey canvas, visible 1px grid lines dividing the page into cells, monospace body text, one giant squared display typeface, one orange accent, and chamfered corners instead of curved ones.";

export const ArenaPreview = () => {
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef(null);

  const resetTyping = () => {
    setTyped('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (!startTime && e.key.length === 1) {
      setStartTime(Date.now());
    }

    if (e.key === 'Backspace') {
      setTyped((prev) => prev.slice(0, -1));
      return;
    }

    if (e.key.length === 1 && typed.length < SAMPLE_PASSAGE.length) {
      const nextTyped = typed + e.key;
      setTyped(nextTyped);

      // Live metrics calculation
      const elapsedMinutes = Math.max((Date.now() - (startTime || Date.now())) / 60000, 0.005);
      let correct = 0;
      for (let i = 0; i < nextTyped.length; i++) {
        if (nextTyped[i] === SAMPLE_PASSAGE[i]) correct++;
      }
      const calculatedWpm = Math.round(correct / 5 / elapsedMinutes);
      const calculatedAcc = Math.round((correct / nextTyped.length) * 100);
      setWpm(calculatedWpm);
      setAccuracy(calculatedAcc);
    }
  };

  return (
    <CropMarkBox
      armLength={14}
      inset={10}
      bracketColor="var(--panel-line)"
      className="bg-panel border border-panel-line p-6 font-mono text-surface relative select-none cursor-text"
      onClick={() => inputRef.current && inputRef.current.focus()}
    >
      {/* Hidden input to capture physical keyboard strokes */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute -z-10"
        onKeyDown={handleKeyDown}
        readOnly
      />

      {/* Arena Header Strip inside dark panel */}
      <div className="flex items-center justify-between border-b border-panel-line pb-3 mb-4 text-xs uppercase tracking-widest text-ink-muted">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-accent inline-block" />
          <span className="text-surface font-medium">LIVE ARENA PREVIEW</span>
        </div>
        <div className="flex items-center gap-4 tabular-nums">
          <span>WPM: <strong className="text-accent">{wpm}</strong></span>
          <span>ACC: <strong className="text-surface">{accuracy}%</strong></span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              resetTyping();
            }}
            className="text-ink-muted hover:text-surface p-1 transition-colors"
            title="Reset Arena"
          >
            <RotateCcw size={14} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          </button>
        </div>
      </div>

      {/* Render Text with mechanical cursor */}
      <div className="text-base sm:text-lg leading-relaxed font-mono min-h-[140px]">
        {SAMPLE_PASSAGE.split('').map((char, index) => {
          let charClass = 'text-ink-muted'; // untyped
          const isTyped = index < typed.length;
          const isCurrent = index === typed.length;

          if (isTyped) {
            if (typed[index] === char) {
              charClass = 'text-surface'; // correct
            } else {
              charClass = 'text-error underline underline-offset-4 decoration-error'; // incorrect
            }
          }

          return (
            <span key={index} className="relative">
              {isCurrent && (
                <span
                  className="absolute -left-[1px] top-[10%] bottom-[10%] w-[9px] bg-accent cursor-step-blink inline-block pointer-events-none"
                  aria-hidden="true"
                />
              )}
              <span className={charClass}>{char}</span>
            </span>
          );
        })}
        {typed.length >= SAMPLE_PASSAGE.length && (
          <span className="inline-block w-[9px] h-5 bg-accent cursor-step-blink ml-1" />
        )}
      </div>

      {/* Footer instruction inside arena */}
      <div className="mt-4 pt-3 border-t border-panel-line flex items-center justify-between text-[11px] uppercase tracking-wider text-ink-muted">
        <span>CLICK AND TYPE TO TEST KEYSTROKE ENGINE</span>
        <span>SAMPLE PASSAGE: 01</span>
      </div>
    </CropMarkBox>
  );
};
