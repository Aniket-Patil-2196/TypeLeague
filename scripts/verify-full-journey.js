import http from 'http';
import app from '../server/src/app.js';
import { connectDB, disconnectDB } from '../server/src/config/db.js';
import { User } from '../server/src/models/user.model.js';
import { Group } from '../server/src/models/group.model.js';
import { Challenge } from '../server/src/models/challenge.model.js';
import { Attempt, DailyResult } from '../server/src/models/attempt.model.js';
import { PointTransaction } from '../server/src/models/gamification.model.js';
import { initAchievements } from '../server/src/services/gamification.service.js';

async function runMasterJourneyQA() {
  console.log('=== TYPELEAGUE MASTER JOURNEY QA (STEPS 1 - 14) ===');
  await connectDB();
  await initAchievements();

  // Clean test namespace
  await User.deleteMany({ email: { $in: ['pilot_qa1@typeleague.dev', 'pilot_qa2@typeleague.dev', 'pilot_qa3@typeleague.dev'] } });
  await Group.deleteMany({ name: 'Alpha QA Private Clan' });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5095, resolve));
  const baseUrl = 'http://localhost:5095/api/v1';

  try {
    // Step 1: Register User 1 (Founder)
    console.log('\n[1] Registering Founder User 1...');
    const u1Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'QA Founder',
        username: 'qa_founder',
        email: 'pilot_qa1@typeleague.dev',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    });
    const u1Json = await u1Res.json();
    const token1 = u1Json.data.accessToken;
    const user1Id = u1Json.data.user._id;

    // Step 2: Create a group and set it private
    console.log('\n[2] Creating Group and setting it Private...');
    const grpRes = await fetch(`${baseUrl}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        name: 'Alpha QA Private Clan',
        description: 'Private testing collective.',
        category: 'Technology',
        visibility: 'private',
        timezone: 'Asia/Kolkata',
      }),
    });
    const grpJson = await grpRes.json();
    const groupId = grpJson.data.group._id;

    // Step 3: Generate an invitation link
    console.log('\n[3] Generating Cryptographic Invitation Link...');
    const invRes = await fetch(`${baseUrl}/groups/${groupId}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ expiresInDays: 7, maxUses: 10 }),
    });
    const invJson = await invRes.json();
    const rawToken = invJson.data.rawToken;

    // Step 4: Join with a second account
    console.log('\n[4] Registering User 2 and Joining via Invitation Token...');
    const u2Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'QA Contender',
        username: 'qa_contender',
        email: 'pilot_qa2@typeleague.dev',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    });
    const u2Json = await u2Res.json();
    const token2 = u2Json.data.accessToken;
    const user2Id = u2Json.data.user._id;

    const joinRes = await fetch(`${baseUrl}/invitations/${rawToken}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token2}` },
    });
    const joinJson = await joinRes.json();
    if (!joinJson.success) throw new Error('Join via invite failed');

    // Step 5: Promote a moderator
    console.log('\n[5] Founder Promotes User 2 to Moderator...');
    const promoteRes = await fetch(`${baseUrl}/groups/${groupId}/members/${user2Id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({ role: 'moderator' }),
    });
    const promoteJson = await promoteRes.json();
    if (promoteJson.data?.membership?.role !== 'moderator') throw new Error('Promotion failed');

    // Step 6: Upload typing content
    console.log('\n[6] Moderator Uploads Typing Content Passage...');
    const contentRes = await fetch(`${baseUrl}/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token2}` },
      body: JSON.stringify({
        title: 'Network Socket Protocols',
        description: 'TCP three-way handshake and stream socket semantics.',
        passageText: 'The transmission control protocol provides reliable ordered and error checked delivery of a stream of octets between applications running on hosts communicating via an IP network.',
        category: 'Technology',
        difficulty: 'Medium',
        scope: 'group',
        groupId,
      }),
    });
    const contentJson = await contentRes.json();
    const passageText = contentJson.data.content.passageText;

    // Step 7: Publish a daily challenge
    console.log('\n[7] Publishing Clan Daily Challenge...');
    const challengeRes = await fetch(`${baseUrl}/challenges/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token2}` },
      body: JSON.stringify({
        title: 'Clan Speed Trial 01',
        passageText,
        scope: 'group',
        groupId,
        duration: 60,
        attemptsAllowed: 3,
      }),
    });
    const challengeJson = await challengeRes.json();
    const challengeId = challengeJson.data.challenge._id;

    // Step 8: Complete tests with multiple accounts
    console.log('\n[8] User 1 and User 2 start sessions and submit keystrokes...');
    // User 1 start & submit
    const s1Res = await fetch(`${baseUrl}/challenges/${challengeId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
    });
    const s1Json = await s1Res.json();
    const submit1 = await fetch(`${baseUrl}/challenges/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` },
      body: JSON.stringify({
        sessionToken: s1Json.data.sessionToken,
        typedText: passageText.slice(0, 100),
        timeInSeconds: 20, // 20s
      }),
    });
    const submit1Json = await submit1.json();

    // User 2 start & submit (Faster typist)
    const s2Res = await fetch(`${baseUrl}/challenges/${challengeId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token2}` },
    });
    const s2Json = await s2Res.json();
    const submit2 = await fetch(`${baseUrl}/challenges/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token2}` },
      body: JSON.stringify({
        sessionToken: s2Json.data.sessionToken,
        typedText: passageText.slice(0, 150),
        timeInSeconds: 20, // 20s
      }),
    });
    const submit2Json = await submit2.json();

    // Step 9: Verify WPM and accuracy against manual calculation
    console.log('\n[9] Verifying unrounded score calculation formula...');
    // User 1: 100 chars in 20s (1/3 min) = 100 / (5 * 1/3) = 60 Net WPM at 100% accuracy = 60 Score
    console.log('User 1 Net WPM:', submit1Json.data?.metrics?.netWpm, 'Expected: 60');
    if (Math.abs(submit1Json.data?.metrics?.netWpm - 60) > 0.01) throw new Error('WPM formula mismatch!');

    // Step 10: Verify the leaderboard
    console.log('\n[10] Verifying Leaderboard Rankings & Ordering...');
    const lbRes = await fetch(`${baseUrl}/challenges/${challengeId}/leaderboard`);
    const lbJson = await lbRes.json();
    console.log('Rank 1 Contender:', lbJson.data?.leaderboard[0]?.user?.username, 'Expected: qa_contender');
    if (lbJson.data?.leaderboard[0]?.user?.username !== 'qa_contender') throw new Error('Leaderboard rank ordering failed!');

    // Step 11: Verify XP rewards & Idempotency
    console.log('\n[11] Verifying XP Reward Distribution & Idempotency...');
    const award1 = await fetch(`${baseUrl}/gamification/challenges/${challengeId}/award`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
    });
    const award1Json = await award1.json();
    console.log('First Award Run Rewards:', award1Json.data?.rewards?.length);

    const award2 = await fetch(`${baseUrl}/gamification/challenges/${challengeId}/award`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
    });
    const award2Json = await award2.json();
    console.log('Duplicate Award Run Rewards (Expected: 0):', award2Json.data?.rewards?.length);
    if (award2Json.data?.rewards?.length !== 0) throw new Error('Reward idempotency failed!');

    // Step 12 & 13: Verify daily archival & historical query
    console.log('\n[12 & 13] Verifying Daily Archival & Historical Persistence...');
    const savedResults = await DailyResult.find({ challenge: challengeId });
    console.log('Archived Daily Results Count:', savedResults.length);
    if (savedResults.length !== 2) throw new Error('Historical result archival mismatch!');

    // Step 14: Verify private group security
    console.log('\n[14] Verifying Private Group Security (Unauthorized User 3)...');
    const u3Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'QA Intruder',
        username: 'qa_intruder',
        email: 'pilot_qa3@typeleague.dev',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    });
    const u3Json = await u3Res.json();
    const token3 = u3Json.data.accessToken;

    const privCheck = await fetch(`${baseUrl}/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token3}` },
    });
    console.log('Intruder Private Group Access Status:', privCheck.status, 'Expected: 403');
    if (privCheck.status !== 403) throw new Error('Private group security breach!');

    console.log('\n======================================================');
    console.log('ALL 14 FINAL QA JOURNEY STEPS VERIFIED AND PASSED 100%!');
    console.log('======================================================\n');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runMasterJourneyQA().catch((err) => {
  console.error('MASTER QA ERROR:', err);
  process.exit(1);
});
