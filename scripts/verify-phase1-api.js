import http from 'http';
import app from '../server/src/app.js';
import { connectDB, disconnectDB } from '../server/src/config/db.js';
import { User } from '../server/src/models/user.model.js';

async function runVerification() {
  console.log('=== PHASE 1 API & AUTH VERIFICATION ===');
  await connectDB();

  // Clean test user if exists
  await User.deleteMany({ email: 'test_pilot@typeleague.dev' });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099/api/v1';

  try {
    // 1. Health Check
    console.log('\n[1] Testing Health Endpoint...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    console.log('Health Response:', healthJson);
    if (healthJson.status !== 'ok') throw new Error('Health check failed');

    // 2. System Status Endpoint
    console.log('\n[2] Testing System Status Endpoint...');
    const statusRes = await fetch(`${baseUrl}/system/status`);
    const statusJson = await statusRes.json();
    console.log('System Status:', statusJson);
    if (statusJson.status !== 'operational') throw new Error('System status failed');

    // 3. Contender Registration
    console.log('\n[3] Testing Registration...');
    const regPayload = {
      fullName: 'Test Pilot Alpha',
      username: 'pilot_alpha',
      email: 'test_pilot@typeleague.dev',
      password: 'SecurePassword123',
      confirmPassword: 'SecurePassword123',
    };
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const regCookie = regRes.headers.get('set-cookie');
    const regJson = await regRes.json();
    console.log('Register Response Success:', regJson.success, 'User:', regJson.data?.user?.username);
    if (!regJson.success || !regJson.data?.accessToken) throw new Error('Registration failed');

    const accessToken = regJson.data.accessToken;

    // 4. Authenticated /me Profile Access
    console.log('\n[4] Testing Authenticated Access to /me...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meJson = await meRes.json();
    console.log('/me Response Success:', meJson.success, 'Username:', meJson.data?.user?.username);
    if (!meJson.success || meJson.data?.user?.email !== 'test_pilot@typeleague.dev') {
      throw new Error('/me verification failed');
    }

    // 5. Contender Login
    console.log('\n[5] Testing Contender Login...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: 'pilot_alpha',
        password: 'SecurePassword123',
      }),
    });
    const loginCookie = loginRes.headers.get('set-cookie');
    const loginJson = await loginRes.json();
    console.log('Login Response Success:', loginJson.success);
    if (!loginJson.success || !loginJson.data?.accessToken) throw new Error('Login failed');

    // 6. Refresh Token Rotation
    console.log('\n[6] Testing Token Refresh with Cookie...');
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: loginCookie,
      },
    });
    const refreshJson = await refreshRes.json();
    console.log('Refresh Response Success:', refreshJson.success, 'New Token Issued:', !!refreshJson.data?.accessToken);
    if (!refreshJson.success || !refreshJson.data?.accessToken) throw new Error('Refresh token rotation failed');

    // 7. Forgot Password
    console.log('\n[7] Testing Password Reset Dispatch...');
    const forgotRes = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_pilot@typeleague.dev' }),
    });
    const forgotJson = await forgotRes.json();
    console.log('Forgot Password Response:', forgotJson);
    if (!forgotJson.success) throw new Error('Forgot password failed');

    console.log('\nALL PHASE 1 BACKEND VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runVerification().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
