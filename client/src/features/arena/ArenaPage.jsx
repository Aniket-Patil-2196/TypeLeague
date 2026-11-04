import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Button,
  Badge,
  CropMarkBox,
  CornerMarker,
  Modal,
  Skeleton,
  EmptyState,
} from '../../components/ui';
import { Play, RotateCcw, Award, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const ArenaPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');
  const contentId = searchParams.get('contentId');
  const challengeId = searchParams.get('challengeId');
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isTypingActive, setIsTypingActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [typedText, setTypedText] = useState('');
  const [events, setEvents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultModal, setResultModal] = useState(null);
  const [error, setError] = useState('');

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const fetchTodayChallenge = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (groupId) {
        params.append('scope', 'group');
        params.append('groupId', groupId);
      }
      if (contentId) {
        params.append('contentId', contentId);
      }
      if (challengeId) {
        params.append('challengeId', challengeId);
      }
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get(`/challenges/today${queryString}`);
      let targetChallenge = res.data.data?.challenge;

      // Fallback if specific challengeId wasn't returned by /challenges/today
      if (!targetChallenge && challengeId) {
        const directRes = await api.get(`/challenges/${challengeId}`);
        targetChallenge = directRes.data.data?.challenge;
      }

      setChallenge(targetChallenge || null);
      if (targetChallenge) {
        setTimeLeft(targetChallenge.duration || 60);
      }
    } catch (err) {
      setError('Failed to load active challenge.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayChallenge();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [groupId, contentId, challengeId]);

  const handleStartSession = async () => {
    if (!challenge) return;
    setError('');
    try {
      const res = await api.post(`/challenges/${challenge._id}/start`);
      setSession(res.data.data);
      setTimeLeft(res.data.data.duration);
      setTypedText('');
      setEvents([]);
      setIsTypingActive(true);
      startTimeRef.current = Date.now();

      if (inputRef.current) {
        inputRef.current.focus();
      }

      // Start Countdown Timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishAttempt();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start session.');
    }
  };

  const handleKeyDown = (e) => {
    if (!isTypingActive) return;

    // Prevent default scroll behavior on Space, Backspace, Tab
    if (e.key === ' ' || e.key === 'Backspace' || e.key === 'Tab') {
      e.preventDefault();
    }

    if (e.key === 'Backspace') {
      setTypedText((prev) => prev.slice(0, -1));
      setEvents((prev) => [
        ...prev,
        { type: 'keydown', key: 'Backspace', offset: Date.now() - startTimeRef.current },
      ]);
      return;
    }

    if (e.key.length === 1) {
      e.preventDefault();
      const nextText = typedText + e.key;
      setTypedText(nextText);
      setEvents((prev) => [
        ...prev,
        { type: 'keydown', key: e.key, offset: Date.now() - startTimeRef.current },
      ]);

      // Complete if entire passage finished
      if (nextText.length >= challenge.passageText.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        finishAttempt(nextText);
      }
    }
  };

  const finishAttempt = async (finalText = typedText) => {
    setIsTypingActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!session) return;

    setIsSubmitting(true);
    const elapsedSeconds = Math.max((Date.now() - startTimeRef.current) / 1000, 1);

    try {
      const res = await api.post('/challenges/submit', {
        sessionToken: session.sessionToken,
        typedText: finalText,
        timeInSeconds: elapsedSeconds,
        events,
      });
      setResultModal(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 font-mono">
        <Skeleton height="h-28" width="w-full" />
        <Skeleton height="h-64" width="w-full" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="p-8 max-w-4xl mx-auto font-mono">
        <EmptyState
          title={groupId ? "CLAN CONTENT UNAVAILABLE" : "NO ACTIVE GLOBAL CHALLENGE"}
          description={
            groupId
              ? "The selected clan passage or daily challenge could not be loaded. Please return to the clan dashboard or select another text."
              : "A new synchronized challenge will activate shortly."
          }
          actionLabel={groupId ? "RETURN TO CLAN" : "CHECK AGAIN"}
          onAction={groupId ? () => navigate(`/groups/${groupId}`) : fetchTodayChallenge}
          indexLabel={groupId ? "[CLAN_EMPTY]" : "[GLOBAL_EMPTY]"}
        />
      </div>
    );
  }

  // Live client estimates (visual only, official score computed server-side)
  const elapsedMinutes = Math.max((Date.now() - (startTimeRef.current || Date.now())) / 60000, 0.005);
  let correctChars = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === challenge.passageText[i]) correctChars++;
  }
  const liveWpm = isTypingActive ? Math.round(correctChars / 5 / elapsedMinutes) : 0;
  const liveAcc = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 100;
  const progressPercent = Math.min(Math.round((typedText.length / challenge.passageText.length) * 100), 100);

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto font-mono text-ink space-y-6">
      {/* 1. Header Banner */}
      <div className="border border-line bg-surface p-6 sm:p-8 relative">
        <CornerMarker position="top-left" size={8} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
              {groupId ? (contentId ? '[ARENA // CLAN_PASSAGE_PRACTICE]' : '[ARENA // CLAN_DAILY_CHALLENGE]') : '[ARENA // SYNCHRONIZED_EVENT]'}
            </span>
            <h1 className="font-display text-2xl sm:text-4xl uppercase font-bold text-ink">
              {challenge.title}
            </h1>
            <p className="text-xs text-ink-soft mt-1">
              Duration: {challenge.duration}s &middot; Attempts: {challenge.attemptsAllowed > 0 ? challenge.attemptsAllowed : 'Unlimited Practice'} &middot; DateKey: {challenge.dateKey}
            </p>
          </div>
          {groupId && (
            <Link to={`/groups/${groupId}`}>
              <Button variant="secondary" size="sm">
                BACK TO CLAN
              </Button>
            </Link>
          )}
          <Badge variant="accent" size="md">
            OFFICIAL DAILY
          </Badge>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-surface border border-error text-error text-xs uppercase tracking-wide">
          {error}
        </div>
      )}

      {/* 2. Typing Arena Main Tile */}
      <div className="border border-line bg-surface p-6">
        {/* Top Progress Track */}
        <div className="w-full h-1.5 bg-line mb-6 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border border-line bg-bg p-4 mb-6 text-center tabular-nums">
          <div>
            <span className="block text-[10px] text-ink-muted uppercase">TIMER REMAINING</span>
            <span className={`font-display text-2xl font-black ${timeLeft <= 10 ? 'text-error' : 'text-ink'}`}>
              {timeLeft}S
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-ink-muted uppercase">EST. WPM</span>
            <span className="font-display text-2xl font-black text-accent">
              {liveWpm}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-ink-muted uppercase">ACCURACY</span>
            <span className="font-display text-2xl font-black text-ink">
              {liveAcc}%
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-ink-muted uppercase">PROGRESS</span>
            <span className="font-display text-2xl font-black text-ink">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Arena Dark Panel Tile */}
        <CropMarkBox
          inset={12}
          armLength={16}
          bracketColor="var(--panel-line)"
          className="bg-panel border border-panel-line p-8 font-mono text-surface relative min-h-[220px] select-none cursor-text"
          onClick={() => isTypingActive && inputRef.current && inputRef.current.focus()}
        >
          {/* Hidden physical keyboard focus */}
          <input
            ref={inputRef}
            type="text"
            className="opacity-0 absolute -z-10"
            onKeyDown={handleKeyDown}
            readOnly
          />

          {!isTypingActive ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-xs uppercase tracking-widest text-accent mb-2">
                SESSION STANDBY
              </span>
              <p className="text-sm text-ink-muted mb-6 max-w-md">
                Click the start button below to issue a cryptographic server attempt session.
                Keyboard input will engage automatically.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartSession}
                className="flex items-center gap-2"
              >
                <Play size={16} strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" />
                <span>COMMENCE TEST SESSION</span>
              </Button>
            </div>
          ) : (
            <div className="text-lg sm:text-2xl leading-relaxed font-mono">
              {challenge.passageText.split('').map((char, index) => {
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
                  <span key={index} className="relative">
                    {isCurrent && (
                      <span
                        className="absolute -left-[1px] top-[10%] bottom-[10%] w-[10px] bg-accent cursor-step-blink inline-block pointer-events-none"
                        aria-hidden="true"
                      />
                    )}
                    <span className={charClass}>{char}</span>
                  </span>
                );
              })}
            </div>
          )}
        </CropMarkBox>

        {isTypingActive && (
          <div className="mt-4 flex justify-between items-center text-xs text-ink-muted uppercase">
            <span>TYPE WITH MECHANICAL CADENCE &middot; STRICT TIMESTAMP VERIFICATION</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => finishAttempt()}
              loading={isSubmitting}
            >
              FINISH ATTEMPT
            </Button>
          </div>
        )}
      </div>

      {/* Official Result Modal */}
      <Modal
        isOpen={!!resultModal}
        onClose={() => setResultModal(null)}
        title="SERVER-VERIFIED OFFICIAL SCORE"
        indexLabel="[TELEMETRY_RECORDED]"
      >
        {resultModal && (
          <div className="space-y-4 font-mono">
            <div className="border border-line bg-surface p-4 text-center">
              <span className="text-xs uppercase text-ink-muted block mb-1">OFFICIAL SCORE</span>
              <div className="font-display text-4xl font-black text-accent tabular-nums">
                {resultModal.metrics?.score?.toFixed(2)} PTS
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs tabular-nums">
              <div className="p-3 border border-line bg-surface">
                <span className="text-ink-muted block">NET WPM</span>
                <span className="text-base font-bold text-ink">
                  {resultModal.metrics?.netWpm?.toFixed(2)}
                </span>
              </div>
              <div className="p-3 border border-line bg-surface">
                <span className="text-ink-muted block">RAW WPM</span>
                <span className="text-base font-bold text-ink">
                  {resultModal.metrics?.rawWpm?.toFixed(2)}
                </span>
              </div>
              <div className="p-3 border border-line bg-surface">
                <span className="text-ink-muted block">ACCURACY</span>
                <span className="text-base font-bold text-ink">
                  {resultModal.metrics?.accuracy?.toFixed(2)}%
                </span>
              </div>
              <div className="p-3 border border-line bg-surface">
                <span className="text-ink-muted block">TIME ELAPSED</span>
                <span className="text-base font-bold text-ink">
                  {resultModal.metrics?.timeInSeconds?.toFixed(1)}S
                </span>
              </div>
            </div>

            <div className="p-3 border border-line bg-bg text-xs">
              <div className="flex justify-between text-ink-muted mb-1">
                <span>VALIDITY STATUS</span>
                <span className="text-ok font-bold">VERIFIED</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>ATTEMPTS USED</span>
                <span className="text-ink font-bold tabular-nums">
                  {resultModal.dailyResult?.attemptsCount}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-line">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setResultModal(null);
                  fetchTodayChallenge();
                }}
              >
                ACKNOWLEDGE SCORE
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
