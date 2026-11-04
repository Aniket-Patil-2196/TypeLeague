import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { CropMarkBox } from '../../../components/ui/CropMarkBox';
import { RotateCcw, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ClanPracticeModal = ({
  isOpen,
  onClose,
  passage,
  groupId,
}) => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const text = passage?.passageText || '';

  // Reset state when opening a new passage
  useEffect(() => {
    if (isOpen) {
      setTypedText('');
      setStartTime(null);
      setIsCompleted(false);
      setElapsedSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, passage]);

  // Handle timer
  useEffect(() => {
    if (startTime && !isCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.max(1, Math.round((Date.now() - startTime) / 1000)));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isCompleted]);

  const handleReset = () => {
    setTypedText('');
    setStartTime(null);
    setIsCompleted(false);
    setElapsedSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (isCompleted || !text) return;

    if (e.key === ' ' || e.key === 'Backspace' || e.key === 'Tab') {
      e.preventDefault();
    }

    if (e.key === 'Backspace') {
      setTypedText((prev) => prev.slice(0, -1));
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();

      if (!startTime) {
        setStartTime(Date.now());
      }

      const next = typedText + e.key;
      setTypedText(next);

      if (next.length >= text.length) {
        setIsCompleted(true);
      }
    }
  };

  if (!isOpen || !passage) return null;

  // Real-time calculations
  const elapsedMinutes = Math.max((elapsedSeconds || 1) / 60, 0.016);
  let correctChars = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === text[i]) correctChars++;
  }
  const liveWpm = typedText.length > 0 ? Math.round(correctChars / 5 / elapsedMinutes) : 0;
  const liveAcc = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 100;
  const progressPercent = text.length > 0 ? Math.min(Math.round((typedText.length / text.length) * 100), 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      indexLabel="[PRACTICE // CLAN_PASSAGE]"
      title={passage.title || 'CLAN TEXT PRACTICE'}
      maxWidth="max-w-4xl"
    >
      <div className="p-6 font-mono text-ink space-y-6">
        {/* Meta badges & Fullscreen Link */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm">{passage.category || 'TECHNOLOGY'}</Badge>
            <Badge variant="outline" size="sm">{passage.difficulty || 'MEDIUM'}</Badge>
            <span className="text-[11px] text-ink-muted tabular-nums">
              {passage.wordCount || text.split(/\s+/).filter(Boolean).length} WORDS &middot; {text.length} CHARS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>RESTART</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                navigate(`/arena?groupId=${groupId}&contentId=${passage._id}`);
              }}
              className="flex items-center gap-1.5"
            >
              <ExternalLink size={12} />
              <span>FULL ARENA</span>
            </Button>
          </div>
        </div>

        {/* Live Performance Strip */}
        <div className="grid grid-cols-4 gap-3 border border-line bg-surface p-4 text-center tabular-nums">
          <div>
            <span className="block text-[10px] text-ink-muted uppercase">NET WPM</span>
            <span className="font-display text-xl sm:text-2xl font-black text-accent">{liveWpm}</span>
          </div>
          <div>
            <span className="block text-[10px] text-ink-muted uppercase">ACCURACY</span>
            <span className="font-display text-xl sm:text-2xl font-black text-ink">{liveAcc}%</span>
          </div>
          <div>
            <span className="block text-[10px] text-ink-muted uppercase">TIME</span>
            <span className="font-display text-xl sm:text-2xl font-black text-ink">{elapsedSeconds}S</span>
          </div>
          <div>
            <span className="block text-[10px] text-ink-muted uppercase">PROGRESS</span>
            <span className="font-display text-xl sm:text-2xl font-black text-ink">{progressPercent}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-line overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Dark Arena Typing Container */}
        <CropMarkBox
          inset={12}
          armLength={16}
          bracketColor="var(--panel-line)"
          className="bg-panel border border-panel-line p-6 font-mono text-surface relative min-h-[220px] select-none cursor-text"
          onClick={() => inputRef.current && inputRef.current.focus()}
        >
          {/* Hidden physical keyboard focus */}
          <input
            ref={inputRef}
            type="text"
            className="opacity-0 absolute -z-10"
            onKeyDown={handleKeyDown}
            readOnly
          />

          {isCompleted ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 border border-ok bg-ok/10 flex items-center justify-center text-ok">
                <Check size={24} strokeWidth={2} />
              </div>
              <h3 className="font-display text-2xl font-bold uppercase text-surface">
                PRACTICE RUN COMPLETED
              </h3>
              <p className="text-xs text-ink-muted max-w-sm">
                Passage successfully typed. Metrics recorded for self-training.
              </p>
              <div className="grid grid-cols-3 gap-6 border border-line bg-bg p-4 w-full max-w-md text-center tabular-nums">
                <div>
                  <span className="block text-[10px] text-ink-muted uppercase">SPEED</span>
                  <span className="font-display text-xl font-bold text-accent">{liveWpm} WPM</span>
                </div>
                <div>
                  <span className="block text-[10px] text-ink-muted uppercase">ACCURACY</span>
                  <span className="font-display text-xl font-bold text-ink">{liveAcc}%</span>
                </div>
                <div>
                  <span className="block text-[10px] text-ink-muted uppercase">DURATION</span>
                  <span className="font-display text-xl font-bold text-ink">{elapsedSeconds}S</span>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <Button variant="primary" size="md" onClick={handleReset}>
                  TRY AGAIN
                </Button>
                <Button variant="secondary" size="md" onClick={onClose}>
                  CLOSE
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-base sm:text-lg leading-relaxed font-mono select-none">
              {text.split('').map((char, index) => {
                let charClass = 'text-ink-muted';
                const isTyped = index < typedText.length;
                const isCurrent = index === typedText.length;

                if (isTyped) {
                  if (typedText[index] === char) {
                    charClass = 'text-surface';
                  } else {
                    charClass = 'text-error underline underline-offset-4 decoration-error';
                  }
                }

                return (
                  <span
                    key={index}
                    className={`${charClass} ${
                      isCurrent ? 'bg-accent text-bg px-0.5' : ''
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          )}
        </CropMarkBox>

        {/* Footer Guidance */}
        <div className="flex items-center justify-between text-[11px] text-ink-muted pt-2 border-t border-line">
          <span>{startTime ? 'TYPING ACTIVE · PRESS BACKSPACE TO CORRECT' : 'CLICK INSIDE AND START TYPING · SPACE ADVANCES WORDS'}</span>
          <span className="tabular-nums">EST. TIME: {passage.estimatedDuration || 60}S</span>
        </div>
      </div>
    </Modal>
  );
};
