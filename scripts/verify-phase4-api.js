import http from 'http';
import app from '../server/src/app.js';
import { connectDB, disconnectDB } from '../server/src/config/db.js';
import { User } from '../server/src/models/user.model.js';
import { Challenge } from '../server/src/models/challenge.model.js';
import { DailyResult } from '../server/src/models/attempt.model.js';
import { PointTransaction } from '../server/src/models/gamification.model.js';
import { initAchievements } from '../server/src/services/gamification.service.js';

async function runPhase4Verification() {
  console.log('=== PHASE 4 LEADERBOARDS & GAMIFICATION VERIFICATION ===');
  await connectDB();
  await initAchievements();

  await User.deleteMany({ email: 'pilot_p4@typeleague.dev' });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5096, resolve));
  const baseUrl = 'http://localhost:5096/api/v1';

  try {
    // 1. Register test contender
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Phase4 Contender',
        username: 'contender_p4',
        email: 'pilot_p4@typeleague.dev',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    });
    const regJson = await regRes.json();
    const token = regJson.data.accessToken;
    const userId = regJson.data.user._id;

    // 2. Fetch Leaderboard
    console.log('\n[1] Querying Standings Leaderboard...');
    const lbRes = await fetch(`${baseUrl}/gamification/leaderboard`);
    const lbJson = await lbRes.json();
    console.log('Standings loaded count:', lbJson.data?.standings?.length);
    if (!lbJson.success) throw new Error('Leaderboard failed');

    // 3. Fetch Achievements
    console.log('\n[2] Querying Achievements Directory...');
    const achRes = await fetch(`${baseUrl}/gamification/achievements`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const achJson = await achRes.json();
    console.log('Achievements total count:', achJson.data?.achievements?.length);
    if (!achJson.success || achJson.data?.achievements?.length < 5) throw new Error('Achievements failed');

    // 4. Test Idempotent Reward Ledger
    console.log('\n[3] Testing Idempotent Reward Ledger...');
    const challenge = await Challenge.findOne();
    if (challenge) {
      // First reward run
      const rewardRun1 = await fetch(`${baseUrl}/gamification/challenges/${challenge._id}/award`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const r1Json = await rewardRun1.json();
      console.log('First Award Run Rewards Count:', r1Json.data?.rewards?.length);

      // Second reward run (MUST NOT duplicate)
      const rewardRun2 = await fetch(`${baseUrl}/gamification/challenges/${challenge._id}/award`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const r2Json = await rewardRun2.json();
      console.log('Second Award Run (Idempotency Check) Count:', r2Json.data?.rewards?.length);
      if (r2Json.data?.rewards?.length !== 0) {
        throw new Error('Idempotency violation! Duplicate rewards awarded!');
      }
    }

    // 5. Query Personal Analytics
    console.log('\n[4] Querying Personal Telemetry Analytics...');
    const analyticsRes = await fetch(`${baseUrl}/gamification/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const analyticsJson = await analyticsRes.json();
    console.log('Analytics Loaded:', !!analyticsJson.data?.user);
    if (!analyticsJson.success) throw new Error('Analytics failed');

    console.log('\nALL PHASE 4 VERIFICATIONS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runPhase4Verification().catch((err) => {
  console.error('PHASE 4 ERROR:', err);
  process.exit(1);
});
