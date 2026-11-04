import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScores, compareAttempts, getDateKey } from '../src/services/scoring.service.js';

test('Scoring Service - exact match typing calculation', () => {
  const passage = 'The quick brown fox jumps over the lazy dog.';
  const typed = 'The quick brown fox jumps over the lazy dog.';
  const timeInSeconds = 30; // 0.5 minutes

  const result = calculateScores({
    passageText: passage,
    typedText: typed,
    timeInSeconds,
    minTypedLength: 10,
  });

  assert.equal(result.correctChars, passage.length);
  assert.equal(result.incorrectChars, 0);
  assert.equal(result.accuracy, 100);

  // Net WPM = 44 / (5 * 0.5) = 17.6
  assert.equal(result.netWpm, 17.6);
  assert.equal(result.rawWpm, 17.6);
  assert.equal(result.score, 17.6);
  assert.equal(result.isValid, true);
});

test('Scoring Service - calculation with errors', () => {
  const passage = 'hello world';
  // index 0..5 ('hello ') match (6 chars)
  // index 6..7 ('ea' vs 'wo') mismatch
  // index 8 ('r' vs 'r') match (1 char)
  // index 9..10 ('th' vs 'ld') mismatch
  // Total correct = 7, total incorrect = 4
  const typed = 'hello earth';
  const timeInSeconds = 12; // 0.2 minutes

  const result = calculateScores({
    passageText: passage,
    typedText: typed,
    timeInSeconds,
    minTypedLength: 5,
  });

  assert.equal(result.correctChars, 7);
  assert.equal(result.incorrectChars, 4);
  // Accuracy = 7 / 11 * 100 = 63.636...%
  assert.ok(Math.abs(result.accuracy - (7 / 11) * 100) < 0.001);
  // Net WPM = 7 / (5 * 0.2) = 7 WPM
  assert.equal(result.netWpm, 7);
  // Raw WPM = 11 / (5 * 0.2) = 11 WPM
  assert.equal(result.rawWpm, 11);
  // Score = 7 * (63.636... / 100) = 4.4545...
  assert.ok(Math.abs(result.score - 7 * (7 / 11)) < 0.001);
});

test('Scoring Service - attempt validity minimum length', () => {
  const passage = 'A very long passage for testing minimum length verification.';
  const typed = 'Short';

  const result = calculateScores({
    passageText: passage,
    typedText: typed,
    timeInSeconds: 5,
    minTypedLength: 20,
  });

  assert.equal(result.isValid, false);
});

test('Scoring Service - tie-break comparator', () => {
  const a = { score: 80, accuracy: 98, netWpm: 80, submittedAt: '2026-11-04T10:00:00Z' };
  const b = { score: 85, accuracy: 95, netWpm: 85, submittedAt: '2026-11-04T10:05:00Z' };
  // b has higher score
  assert.ok(compareAttempts(a, b) > 0);

  const c = { score: 80, accuracy: 98, netWpm: 80, submittedAt: '2026-11-04T10:00:00Z' };
  const d = { score: 80, accuracy: 99, netWpm: 80, submittedAt: '2026-11-04T10:05:00Z' };
  // d has higher accuracy
  assert.ok(compareAttempts(c, d) > 0);

  const e = { score: 80, accuracy: 98, netWpm: 80, submittedAt: '2026-11-04T10:00:00Z' };
  const f = { score: 80, accuracy: 98, netWpm: 80, submittedAt: '2026-11-04T09:50:00Z' };
  // f submitted earlier
  assert.ok(compareAttempts(e, f) > 0);
});

test('Scoring Service - date key in timezone', () => {
  const d = new Date('2026-11-04T22:00:00Z');
  // At 22:00 UTC, in Asia/Kolkata (+5:30) it is 03:30 on 2026-11-05
  const key = getDateKey(d, 'Asia/Kolkata');
  assert.equal(key, '2026-11-05');
});
