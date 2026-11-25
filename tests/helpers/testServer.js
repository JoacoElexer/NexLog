"use strict";

const http = require('node:http');
const { PassThrough } = require('node:stream');

function ensureTestEnv() {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'nexlog_test_jwt_secret_not_for_production';
  }
  if (!process.env.JWT_EXPIRES_IN) {
    process.env.JWT_EXPIRES_IN = '1h';
  }
}

async function startTestServer() {
  ensureTestEnv();
  const app = require('../../src/app');

  async function request(path, { method = 'GET', headers = {}, body } = {}) {
    const normalizedHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
      normalizedHeaders[key.toLowerCase()] = value;
    }

    let payloadBuffer = null;
    if (body !== undefined) {
      normalizedHeaders['content-type'] = normalizedHeaders['content-type'] || 'application/json';
      const serialized = typeof body === 'string' ? body : JSON.stringify(body);
      payloadBuffer = Buffer.from(serialized, 'utf8');
      normalizedHeaders['content-length'] = String(payloadBuffer.length);
    }

    const reqSocket = new PassThrough();
    reqSocket.remoteAddress = '127.0.0.1';
    const req = new http.IncomingMessage(reqSocket);
    req.method = method.toUpperCase();
    req.url = path;
    req.headers = normalizedHeaders;

    if (payloadBuffer) {
      req.push(payloadBuffer);
    }
    req.push(null);

    const resSocket = new PassThrough();
    const rawChunks = [];
    resSocket.on('data', (chunk) => rawChunks.push(chunk));

    const res = new http.ServerResponse(req);
    res.assignSocket(resSocket);

    await new Promise((resolve, reject) => {
      res.on('finish', resolve);
      res.on('error', reject);
      app(req, res, (err) => {
        if (err) reject(err);
      });
    });

    const rawOutput = Buffer.concat(rawChunks).toString('utf8');
    const separatorIndex = rawOutput.indexOf('\r\n\r\n');
    const bodyText = separatorIndex >= 0 ? rawOutput.slice(separatorIndex + 4) : '';

    let parsedBody = null;
    if (bodyText) {
      try {
        parsedBody = JSON.parse(bodyText);
      } catch {
        parsedBody = bodyText;
      }
    }

    return {
      status: res.statusCode,
      headers: res.getHeaders(),
      body: parsedBody,
    };
  }

  async function close() {}

  return { request, close };
}

async function startLiveTestServer() {
  ensureTestEnv();
  const app = require('../../src/app');
  const server = http.createServer(app);

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  async function request(path, { method = 'GET', headers = {}, body } = {}) {
    const finalHeaders = { ...headers };
    let serializedBody;
    if (body !== undefined) {
      finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json';
      serializedBody = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: finalHeaders,
      body: serializedBody,
    });

    const text = await response.text();
    let parsedBody = null;
    if (text) {
      try {
        parsedBody = JSON.parse(text);
      } catch {
        parsedBody = text;
      }
    }

    return {
      status: response.status,
      headers: response.headers,
      body: parsedBody,
    };
  }

  async function close() {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }

  return { server, baseUrl, request, close };
}

module.exports = { ensureTestEnv, startTestServer, startLiveTestServer };
