import http from 'http';
import app from '../server/src/app.js';
import { connectDB, disconnectDB } from '../server/src/config/db.js';
import { User } from '../server/src/models/user.model.js';

async function runPhase3Verification() {
  console.log('=== PHASE 3 ENGINE & ARENA VERIFICATION ===');
  await connectDB();

  await User.deleteMany({ email: 'pilot_p3@typeleague.dev' });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5097, resolve));
  const baseUrl = 'http://localhost:5097/api/v1';

  try {
    // 1. Register pilot
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Phase3 Pilot',
        username: 'pilot_p3',
        email: 'pilot_p3@typeleague.dev',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    });
    const regJson = await regRes.json();
    const token = regJson.data.accessToken;

    // 2. Fetch Today Challenge
    console.log('\n[1] Fetching Today Challenge...');
    const challengeRes = await fetch(`${baseUrl}/challenges/today`);
    const challengeJson = await challengeRes.json();
    const challenge = challengeJson.data.challenge;
    console.log('Challenge Loaded:', challenge?.title, 'ID:', challenge?._id);
    if (!challenge) throw new Error('Failed to get today challenge');

    // 3. Start Session
    console.log('\n[2] Starting Session...');
    const startRes = await fetch(`${baseUrl}/challenges/${challenge._id}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const startJson = await startRes.json();
    console.log('Session Token issued:', !!startJson.data?.sessionToken);
    const sessionToken = startJson.data.sessionToken;

    // 4. Submit Attempt
    console.log('\n[3] Submitting Keystrokes & Server-Side Scoring...');
    const submitRes = await fetch(`${baseUrl}/challenges/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionToken,
        typedText: challenge.passageText.slice(0, 80),
        timeInSeconds: 15,
        events: [{ type: 'keydown', key: 'a', offset: 100 }],
      }),
    });
    const submitJson = await submitRes.json();
    console.log('Submit Success:', submitJson.success, 'Official Score:', submitJson.data?.metrics?.score);
    if (!submitJson.success || !submitJson.data?.metrics?.score) throw new Error('Attempt submission failed');

    // 5. Query Leaderboard
    console.log('\n[4] Querying Challenge Leaderboard...');
    const lbRes = await fetch(`${baseUrl}/challenges/${challenge._id}/leaderboard`);
    const lbJson = await lbRes.json();
    console.log('Leaderboard Contenders count:', lbJson.data?.leaderboard?.length);
    if (!lbJson.success || lbJson.data?.leaderboard?.length === 0) throw new Error('Leaderboard query failed');

    console.log('\nALL PHASE 3 VERIFICATIONS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runPhase3Verification().catch((err) => {
  console.error('PHASE 3 ERROR:', err);
  process.exit(1);
});
