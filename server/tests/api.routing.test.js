import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app, { isOriginAllowed } from '../src/app.js';

test('CORS origin validator allows Vercel and local origins', () => {
  assert.equal(isOriginAllowed('https://typeleague.vercel.app'), true);
  assert.equal(isOriginAllowed('https://typeleague-preview-abc123.vercel.app'), true);
  assert.equal(isOriginAllowed('http://localhost:5173'), true);
  assert.equal(isOriginAllowed('http://127.0.0.1:5173'), true);
  assert.equal(isOriginAllowed(''), true); // allows server-to-server / curl
  assert.equal(isOriginAllowed('https://malicious-site.com'), false);
});

test('Express app exposes /health with 200 OK', (_, done) => {
  const req = new http.IncomingMessage();
  req.method = 'GET';
  req.url = '/health';
  req.headers = { host: '127.0.0.1' };

  const res = new http.ServerResponse(req);
  let body = '';
  res.write = (chunk) => {
    body += chunk;
    return true;
  };
  res.end = (chunk) => {
    if (chunk) body += chunk;
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(body);
    assert.equal(data.status, 'ok');
    assert.equal(data.service, 'TypeLeague Core API');
    done();
  };

  app.handle(req, res);
});

test('Express app exposes /api/v1/health with 200 OK', (_, done) => {
  const req = new http.IncomingMessage();
  req.method = 'GET';
  req.url = '/api/v1/health';
  req.headers = { host: '127.0.0.1' };

  const res = new http.ServerResponse(req);
  let body = '';
  res.write = (chunk) => {
    body += chunk;
    return true;
  };
  res.end = (chunk) => {
    if (chunk) body += chunk;
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(body);
    assert.equal(data.status, 'ok');
    assert.equal(data.timezone, 'Asia/Kolkata');
    done();
  };

  app.handle(req, res);
});

test('Express app exposes /api/v1/system/status with operational status', (_, done) => {
  const req = new http.IncomingMessage();
  req.method = 'GET';
  req.url = '/api/v1/system/status';
  req.headers = { host: '127.0.0.1' };

  const res = new http.ServerResponse(req);
  let body = '';
  res.write = (chunk) => {
    body += chunk;
    return true;
  };
  res.end = (chunk) => {
    if (chunk) body += chunk;
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(body);
    assert.equal(data.status, 'operational');
    assert.equal(data.timezone, 'Asia/Kolkata');
    done();
  };

  app.handle(req, res);
});
