/**
 * TypeLeague Scoring Engine (Section 3 Specifications)
 */

export const calculateScores = ({
  passageText = '',
  typedText = '',
  timeInSeconds = 0,
  events = [],
  minTypedLength = 20,
}) => {
  const safeTimeInMinutes = Math.max(timeInSeconds / 60, 0.001);

  // Compare character by character up to typedText.length
  let correctChars = 0;
  let incorrectChars = 0;

  const compareLength = Math.min(typedText.length, passageText.length);
  for (let i = 0; i < compareLength; i++) {
    if (typedText[i] === passageText[i]) {
      correctChars++;
    } else {
      incorrectChars++;
    }
  }

  // Any characters typed beyond the passage length are counted as incorrect
  if (typedText.length > passageText.length) {
    incorrectChars += typedText.length - passageText.length;
  }

  const totalTypedCharacters = typedText.length;

  // Net WPM = Correct Characters / (5 * Time in Minutes)
  const netWpm = correctChars / (5 * safeTimeInMinutes);

  // Raw WPM = Total Characters Typed / (5 * Time in Minutes)
  const rawWpm = totalTypedCharacters / (5 * safeTimeInMinutes);

  // Accuracy = Correct Characters / (Correct Characters + Incorrect Characters) * 100
  const evaluatedChars = correctChars + incorrectChars;
  const accuracy = evaluatedChars > 0 ? (correctChars / evaluatedChars) * 100 : 0;

  // Score = Net WPM * (Accuracy / 100)
  const score = netWpm * (accuracy / 100);

  // Keystroke accuracy from event log (informational)
  let totalKeystrokes = 0;
  let mistakeKeystrokes = 0;
  if (events && Array.isArray(events)) {
    for (const evt of events) {
      if (evt.type === 'keydown' && evt.key && evt.key.length === 1) {
        totalKeystrokes++;
        if (evt.isMistake) mistakeKeystrokes++;
      }
    }
  }
  const keystrokeAccuracy = totalKeystrokes > 0
    ? ((totalKeystrokes - mistakeKeystrokes) / totalKeystrokes) * 100
    : accuracy;

  const isValid = totalTypedCharacters >= minTypedLength;

  return {
    correctChars,
    incorrectChars,
    totalTypedCharacters,
    timeInSeconds,
    timeInMinutes: safeTimeInMinutes,
    netWpm,
    rawWpm,
    accuracy,
    keystrokeAccuracy,
    score,
    isValid,
  };
};

/**
 * Tie-break comparator:
 * 1. Higher score
 * 2. Higher accuracy
 * 3. Higher net WPM
 * 4. Earlier qualifying submission
 */
export const compareAttempts = (a, b) => {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  if (b.accuracy !== a.accuracy) {
    return b.accuracy - a.accuracy;
  }
  if (b.netWpm !== a.netWpm) {
    return b.netWpm - a.netWpm;
  }
  return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
};

/**
 * Generate standardized YYYY-MM-DD date key in specified timezone
 */
export const getDateKey = (date = new Date(), timezone = 'Asia/Kolkata') => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date); // outputs YYYY-MM-DD
};
