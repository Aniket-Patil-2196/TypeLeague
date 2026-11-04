import http from 'http';
import app from '../server/src/app.js';
import { connectDB, disconnectDB } from '../server/src/config/db.js';
import { User } from '../server/src/models/user.model.js';
import { Group } from '../server/src/models/group.model.js';
import { Membership } from '../server/src/models/membership.model.js';
import { Invitation } from '../server/src/models/invitation.model.js';
import { TypingContent } from '../server/src/models/content.model.js';
import { seedSharedContent } from '../server/src/utils/seed.js';

async function runPhase2Verification() {
  console.log('=== PHASE 2 GROUPS & CONTENT VERIFICATION ===');
  await connectDB();

  // Clean test artifacts
  await User.deleteMany({ email: { $in: ['owner_p2@typeleague.dev', 'member_p2@typeleague.dev', 'guest_p2@typeleague.dev'] } });
  await Group.deleteMany({ name: { $in: ['Phase 2 Public Clan', 'Phase 2 Private Guild'] } });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5098, resolve));
  const baseUrl = 'http://localhost:5098/api/v1';

  try {
    // 1. Create two test users (Owner and Member)
    console.log('\n[1] Registering Owner and Member accounts...');
    const ownerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Phase2 Owner',
        username: 'owner_p2',
        email: 'owner_p2@typeleague.dev',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    });
    const ownerJson = await ownerRes.json();
    const ownerToken = ownerJson.data.accessToken;
    const ownerId = ownerJson.data.user._id;

    const memberRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Phase2 Member',
        username: 'member_p2',
        email: 'member_p2@typeleague.dev',
        password: 'Password123',
        confirmPassword: 'Password123',
      }),
    });
    const memberJson = await memberRes.json();
    const memberToken = memberJson.data.accessToken;
    const memberId = memberJson.data.user._id;

    // Seed shared library
    await seedSharedContent(ownerId);

    // 2. Create Public Group
    console.log('\n[2] Creating Public Group...');
    const pubGroupRes = await fetch(`${baseUrl}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Phase 2 Public Clan',
        description: 'An open competitive typing collective for mechanical speed testing.',
        category: 'Technology',
        visibility: 'public',
        rules: 'Standard mechanical rules.',
        timezone: 'Asia/Kolkata',
      }),
    });
    const pubGroupJson = await pubGroupRes.json();
    console.log('Public Group Created:', pubGroupJson.success, 'ID:', pubGroupJson.data?.group?._id);
    if (!pubGroupJson.success) throw new Error('Failed to create public group');
    const pubGroupId = pubGroupJson.data.group._id;

    // 3. Member joins Public Group
    console.log('\n[3] Regular Member joins Public Group...');
    const joinRes = await fetch(`${baseUrl}/groups/${pubGroupId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    const joinJson = await joinRes.json();
    console.log('Join Public Group Success:', joinJson.success);
    if (!joinJson.success) throw new Error('Failed to join public group');

    // 4. Create Private Group
    console.log('\n[4] Creating Private Group...');
    const privGroupRes = await fetch(`${baseUrl}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Phase 2 Private Guild',
        description: 'Exclusive batch workspace.',
        category: 'Coding Community',
        visibility: 'private',
        timezone: 'Asia/Kolkata',
      }),
    });
    const privGroupJson = await privGroupRes.json();
    console.log('Private Group Created:', privGroupJson.success);
    const privGroupId = privGroupJson.data.group._id;

    // 5. Verify Member CANNOT directly join Private Group
    console.log('\n[5] Verifying Private Group direct join rejection...');
    const directJoinPriv = await fetch(`${baseUrl}/groups/${privGroupId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    const directJoinPrivJson = await directJoinPriv.json();
    console.log('Rejection Success (expected error):', directJoinPrivJson.message);
    if (directJoinPriv.status !== 400) throw new Error('Private group allowed direct join!');

    // 6. Generate Cryptographic Invitation Link
    console.log('\n[6] Owner generates Invitation Link for Private Group...');
    const inviteRes = await fetch(`${baseUrl}/groups/${privGroupId}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ expiresInDays: 7, maxUses: 5 }),
    });
    const inviteJson = await inviteRes.json();
    console.log('Invite Generated:', inviteJson.success, 'Raw Token length:', inviteJson.data?.rawToken?.length);
    if (!inviteJson.success || !inviteJson.data?.rawToken) throw new Error('Failed to generate invite');
    const rawToken = inviteJson.data.rawToken;

    // 7. Verify Invitation Token
    console.log('\n[7] Verifying Invitation Token...');
    const verifyInviteRes = await fetch(`${baseUrl}/invitations/${rawToken}/verify`);
    const verifyInviteJson = await verifyInviteRes.json();
    console.log('Invitation Verified for Group:', verifyInviteJson.data?.invitation?.group?.name);
    if (!verifyInviteJson.success) throw new Error('Invitation verification failed');

    // 8. Member Joins via Invitation Link
    console.log('\n[8] Member accepts Invitation and joins Private Group...');
    const acceptInviteRes = await fetch(`${baseUrl}/invitations/${rawToken}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    const acceptInviteJson = await acceptInviteRes.json();
    console.log('Joined via Invite Success:', acceptInviteJson.success);
    if (!acceptInviteJson.success) throw new Error('Join via invite failed');

    // 9. Role Management: Owner Promotes Member to Moderator
    console.log('\n[9] Owner promotes Member to Moderator in Private Group...');
    const promoteRes = await fetch(`${baseUrl}/groups/${privGroupId}/members/${memberId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ role: 'moderator' }),
    });
    const promoteJson = await promoteRes.json();
    console.log('Promotion Success:', promoteJson.success, 'New Role:', promoteJson.data?.membership?.role);
    if (promoteJson.data?.membership?.role !== 'moderator') throw new Error('Role promotion failed');

    // 10. Content Management: Create Passage in Private Group
    console.log('\n[10] Moderator creates Typing Content in Private Group...');
    const contentRes = await fetch(`${baseUrl}/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`,
      },
      body: JSON.stringify({
        title: 'Compiler Construction Basics',
        description: 'Lexical analysis and abstract syntax tree generation concepts.',
        passageText: 'A compiler translates source code into machine-executable binary representations. The front-end parses lexical tokens and builds intermediate syntax structures, while the optimization pipeline eliminates dead code and optimizes loop instructions.',
        category: 'Programming',
        difficulty: 'Hard',
        scope: 'group',
        groupId: privGroupId,
      }),
    });
    const contentJson = await contentRes.json();
    console.log('Content Created Success:', contentJson.success, 'Words:', contentJson.data?.content?.wordCount);
    if (!contentJson.success || contentJson.data?.content?.wordCount < 10) throw new Error('Content creation failed');

    // 11. Query Shared Platform Library
    console.log('\n[11] Querying Shared Platform Library...');
    const sharedRes = await fetch(`${baseUrl}/content/shared`);
    const sharedJson = await sharedRes.json();
    console.log('Shared Library Passages count:', sharedJson.data?.items?.length);
    if (!sharedJson.success || sharedJson.data?.items?.length === 0) throw new Error('Shared library query failed');

    console.log('\nALL PHASE 2 BACKEND VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runPhase2Verification().catch((err) => {
  console.error('PHASE 2 VERIFICATION ERROR:', err);
  process.exit(1);
});
