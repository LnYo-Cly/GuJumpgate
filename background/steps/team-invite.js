(function attachBackgroundTeamInvite(root, factory) {
  root.MultiPageBackgroundTeamInvite = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createTeamInviteModule() {

  const CHATGPT_API = 'https://chatgpt.com/backend-api';
  const AUTH_BASE = 'https://auth.openai.com';
  const AUTH_TOKEN_URL = AUTH_BASE + '/oauth/token';
  const AUTH_AUTHORIZE_URL = AUTH_BASE + '/oauth/authorize';
  const CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
  const REDIRECT_URI = 'http://localhost:1455/auth/callback';
  const OAUTH_SCOPE = 'openid profile email offline_access';
  const MAX_RETRIES = 3;
  const INVITE_PROPAGATION_DELAY_MS = 4000;

  function normalizeString(value) {
    return String(value || '').trim();
  }

  // ── PKCE helpers ──

  function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, function (b) { return chars[b % chars.length]; }).join('');
  }

  async function sha256(message) {
    var data = new TextEncoder().encode(message);
    return crypto.subtle.digest('SHA-256', data);
  }

  function base64UrlEncode(buffer) {
    var bytes = new Uint8Array(buffer);
    var binary = '';
    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decodeJwtSegment(segment) {
    var raw = (segment || '').trim();
    if (!raw) return {};
    var pad = '='.repeat((4 - (raw.length % 4)) % 4);
    try {
      return JSON.parse(atob((raw + pad).replace(/-/g, '+').replace(/_/g, '/')));
    } catch (_) {
      return {};
    }
  }

  // ── Cookie helpers ──

  async function getCookieString(chrome, domains) {
    var all = [];
    for (var i = 0; i < domains.length; i++) {
      var cookies = await chrome.cookies.getAll({ domain: domains[i] });
      all = all.concat(cookies);
    }
    var seen = {};
    var unique = [];
    for (var j = 0; j < all.length; j++) {
      if (!seen[all[j].name]) {
        seen[all[j].name] = true;
        unique.push(all[j].name + '=' + all[j].value);
      }
    }
    return unique.join('; ');
  }

  async function getDidFromCookies(chrome) {
    var cookies = await chrome.cookies.getAll({ domain: '.openai.com' });
    for (var i = 0; i < cookies.length; i++) {
      if (cookies[i].name === 'oai-did') return cookies[i].value;
    }
    return '';
  }

  // ── Auth cookie workspace parsing ──

  function parseWorkspacesFromAuthCookie(cookieValue) {
    if (!cookieValue || cookieValue.indexOf('.') === -1) return [];
    var parts = cookieValue.split('.');
    var claims = decodeJwtSegment(parts.length >= 2 ? parts[1] : parts[0]);
    var ws = claims.workspaces || [];
    if (ws.length) return ws;
    claims = decodeJwtSegment(parts[0]);
    return claims.workspaces || [];
  }

  // ── HTTP helpers ──

  function buildAuthHeaders(accessToken, workspaceId) {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Origin': 'https://chatgpt.com',
      'Referer': 'https://chatgpt.com/',
      'Authorization': 'Bearer ' + accessToken,
      'chatgpt-account-id': workspaceId,
    };
  }

  function oaiHeaders(did, extra) {
    var h = {
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'oai-device-id': did || '',
    };
    if (extra) {
      var keys = Object.keys(extra);
      for (var i = 0; i < keys.length; i++) h[keys[i]] = extra[keys[i]];
    }
    return h;
  }

  async function followRedirectChain(startUrl, cookieString, did, maxRedirects) {
    var currentUrl = startUrl;
    for (var i = 0; i < (maxRedirects || 15); i++) {
      var resp = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'Cookie': cookieString,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'oai-device-id': did || '',
        },
      });
      if (resp.status >= 300 && resp.status < 400) {
        var location = resp.headers.get('Location') || '';
        if (!location) return currentUrl;
        currentUrl = new URL(location, currentUrl).href;
        if (currentUrl.indexOf('code=') !== -1 && currentUrl.indexOf('state=') !== -1) {
          return currentUrl;
        }
        continue;
      }
      return currentUrl;
    }
    return currentUrl;
  }

  // ── Token operations ──

  async function refreshAccessToken(refreshToken) {
    var body = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      redirect_uri: REDIRECT_URI,
    });
    var resp = await fetch(AUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: body.toString(),
    });
    if (!resp.ok) {
      var text = await resp.text().catch(function () { return ''; });
      throw new Error('Team token refresh failed: HTTP ' + resp.status + ' ' + text.slice(0, 200));
    }
    var data = await resp.json();
    return {
      access_token: data.access_token || '',
      refresh_token: data.refresh_token || refreshToken,
    };
  }

  async function sendInvite(accessToken, workspaceId, email) {
    var resp = await fetch(CHATGPT_API + '/accounts/' + encodeURIComponent(workspaceId) + '/invites', {
      method: 'POST',
      headers: buildAuthHeaders(accessToken, workspaceId),
      body: JSON.stringify({ email_addresses: [email], role: 'standard-user', seat_type: 'usage_based', resend_emails: true }),
    });
    if (resp.status === 200 || resp.status === 201) {
      return { success: true, status: 'invited', message: '邀请已发送' };
    }
    var bodyText = await resp.text().catch(function () { return ''; });
    if (resp.status === 409 || resp.status === 422) {
      var lower = bodyText.toLowerCase();
      if (lower.indexOf('member') !== -1 || lower.indexOf('workspace') !== -1 || lower.indexOf('already') !== -1) {
        return { success: true, status: 'already_member', message: '已是工作区成员或已邀请' };
      }
      return { success: true, status: 'already_invited', message: '邀请已存在' };
    }
    if (resp.status === 401 || resp.status === 403) {
      return { success: false, status: 'auth_failed', message: 'Team token 无效或已过期' };
    }
    if (resp.status === 429) {
      return { success: false, status: 'rate_limited', message: '请求过于频繁' };
    }
    return { success: false, status: 'failed', message: 'HTTP ' + resp.status + ': ' + bodyText.slice(0, 200) };
  }

  async function exchangeCodeForTokens(code, codeVerifier) {
    var body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    });
    var resp = await fetch(AUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: body.toString(),
    });
    if (!resp.ok) {
      var text = await resp.text().catch(function () { return ''; });
      throw new Error('Token exchange failed: HTTP ' + resp.status + ' ' + text.slice(0, 300));
    }
    return resp.json();
  }

  // ── Main token acquisition flow (pure HTTP, no browser) ──

  async function acquireRefreshTokenViaHttp(state, chrome, addLog, sleepWithStop) {
    await addLog('Team 邀请：正在通过 HTTP API 获取凭证（免浏览器 OAuth）...', 'info');

    var did = await getDidFromCookies(chrome);
    if (!did) {
      throw new Error('未找到 oai-did cookie，无法通过 HTTP 获取凭证');
    }

    var codeVerifier = generateRandomString(43);
    var hashBuf = await sha256(codeVerifier);
    var codeChallenge = base64UrlEncode(hashBuf);
    var oauthState = generateRandomString(24);

    var params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: OAUTH_SCOPE,
      state: oauthState,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      id_token_add_organizations: 'true',
      codex_cli_simplified_flow: 'true',
    });
    var authUrl = AUTH_AUTHORIZE_URL + '?' + params.toString();

    var cookieString = await getCookieString(chrome, [
      '.openai.com', 'auth.openai.com',
      '.chatgpt.com', 'chatgpt.com',
    ]);

    await addLog('Team 邀请：正在发起 OAuth 授权请求...', 'info');
    var finalUrl = await followRedirectChain(authUrl, cookieString, did, 20);

    // Check if we got a code= URL directly
    var parsedCode = '';
    try {
      var urlObj = new URL(finalUrl);
      parsedCode = urlObj.searchParams.get('code') || '';
    } catch (_) {}

    if (!parsedCode) {
      // Try workspace selection
      var authCookie = '';
      var authCookies = await chrome.cookies.getAll({ domain: '.openai.com' });
      for (var i = 0; i < authCookies.length; i++) {
        if (authCookies[i].name === 'oai-client-auth-session') {
          authCookie = authCookies[i].value;
          break;
        }
      }

      var workspaces = parseWorkspacesFromAuthCookie(authCookie);
      if (workspaces.length === 0) {
        throw new Error('OAuth 未返回 code 且无工作区信息，HTTP 凭证获取失败');
      }

      // Select Personal workspace (like the registration tool)
      var targetWorkspaceId = '';
      for (var j = 0; j < workspaces.length; j++) {
        var title = String(workspaces[j].title || workspaces[j].name || '');
        if (title.indexOf('Personal') !== -1 || title.indexOf('个人') !== -1 || workspaces[j].is_personal) {
          targetWorkspaceId = String(workspaces[j].id || '');
          break;
        }
      }
      if (!targetWorkspaceId && workspaces.length > 0) {
        targetWorkspaceId = String(workspaces[0].id || '');
      }
      if (!targetWorkspaceId) {
        throw new Error('未找到可用工作区');
      }

      await addLog('Team 邀请：正在选择工作区...', 'info');

      // Refresh cookies after potential redirect chain
      cookieString = await getCookieString(chrome, [
        '.openai.com', 'auth.openai.com',
        '.chatgpt.com', 'chatgpt.com',
      ]);

      var selectResp = await fetch(AUTH_BASE + '/api/accounts/workspace/select', {
        method: 'POST',
        headers: oaiHeaders(did, {
          'Content-Type': 'application/json',
          'Referer': AUTH_BASE + '/sign-in-with-chatgpt/codex/consent',
          'Cookie': cookieString,
        }),
        body: JSON.stringify({ workspace_id: targetWorkspaceId }),
        redirect: 'manual',
      });

      var selectData;
      try {
        selectData = await selectResp.json();
      } catch (_) {
        selectData = {};
      }

      var continueUrl = String(selectData.continue_url || '').trim();
      if (!continueUrl) {
        throw new Error('workspace/select 未返回 continue_url，HTTP 凭证获取失败');
      }

      await addLog('Team 邀请：正在跟随重定向获取授权码...', 'info');
      cookieString = await getCookieString(chrome, [
        '.openai.com', 'auth.openai.com',
        '.chatgpt.com', 'chatgpt.com',
      ]);
      finalUrl = await followRedirectChain(continueUrl, cookieString, did, 15);

      try {
        var finalUrlObj = new URL(finalUrl);
        parsedCode = finalUrlObj.searchParams.get('code') || '';
      } catch (_) {}
    }

    if (!parsedCode) {
      throw new Error('未能获取 OAuth authorization code');
    }

    await addLog('Team 邀请：已获取授权码，正在换取 refresh_token...', 'info');
    var tokenData = await exchangeCodeForTokens(parsedCode, codeVerifier);

    if (!tokenData.refresh_token) {
      throw new Error('Token exchange 未返回 refresh_token');
    }

    await addLog('Team 邀请：refresh_token 获取成功！', 'ok');

    return {
      accessToken: tokenData.access_token || '',
      refreshToken: tokenData.refresh_token,
      email: state.email || '',
      teamTokenAcquired: true,
    };
  }

  // ── Executor ──

  function createTeamInviteExecutor(deps) {
    var {
      addLog = async function () {},
      completeNodeFromBackground,
      getState = function () { return {}; },
      sleepWithStop = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); },
      chrome = typeof self !== 'undefined' && self.chrome ? self.chrome :
               typeof globalThis !== 'undefined' && globalThis.chrome ? globalThis.chrome : null,
      setState = async function () {},
    } = deps || {};

    async function executeTeamInvite(state) {
      if (!state?.teamInviteEnabled) {
        await completeNodeFromBackground('team-invite', { teamInviteSkipped: true });
        return;
      }

      var accessToken = normalizeString(state.teamAccessToken);
      var refreshToken = normalizeString(state.teamRefreshToken);
      var workspaceId = normalizeString(state.teamWorkspaceId);
      var email = normalizeString(state.email);

      if (!accessToken) {
        await addLog('Team 邀请：未配置 Team access_token，跳过。', 'warn');
        await completeNodeFromBackground('team-invite', { teamInviteSkipped: true });
        return;
      }
      if (!workspaceId) {
        await addLog('Team 邀请：未配置 Team 工作区 ID，跳过。', 'warn');
        await completeNodeFromBackground('team-invite', { teamInviteSkipped: true });
        return;
      }
      if (!email) {
        await addLog('Team 邀请：未找到注册邮箱，跳过。', 'warn');
        await completeNodeFromBackground('team-invite', { teamInviteSkipped: true });
        return;
      }

      // ── Phase 1: Send invite ──

      await addLog('Team 邀请：正在邀请 ' + email + ' 加入工作区 ' + workspaceId + '...', 'info');

      var currentToken = accessToken;
      var lastResult;

      for (var attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        lastResult = await sendInvite(currentToken, workspaceId, email);

        if (lastResult.success) break;

        if (lastResult.status === 'auth_failed' && refreshToken) {
          await addLog('Team 邀请：token 无效，尝试刷新...', 'info');
          try {
            var refreshed = await refreshAccessToken(refreshToken);
            currentToken = refreshed.access_token;
            lastResult = await sendInvite(currentToken, workspaceId, email);
            if (lastResult.success) break;
          } catch (e) {
            await addLog('Team 邀请：token 刷新失败：' + e.message, 'warn');
          }
          break;
        }

        if (lastResult.status === 'rate_limited' && attempt < MAX_RETRIES) {
          var delay = Math.min(18000, Math.pow(2, attempt + 1) * 1000);
          await addLog('Team 邀请：频率限制，等待 ' + Math.round(delay / 1000) + 's 后重试...', 'warn');
          await sleepWithStop(delay);
          continue;
        }

        break;
      }

      if (lastResult?.success) {
        await addLog('Team 邀请：' + lastResult.message, 'ok');
        await addLog('Team 邀请：等待 ' + Math.round(INVITE_PROPAGATION_DELAY_MS / 1000) + 's 让邀请生效...', 'info');
        await sleepWithStop(INVITE_PROPAGATION_DELAY_MS);
      } else {
        await addLog('Team 邀请失败：' + (lastResult?.message || '未知错误') + '，流程将继续。', 'warn');
        await completeNodeFromBackground('team-invite', {
          teamInviteSent: false,
          teamInviteStatus: lastResult?.status || 'unknown',
        });
        return;
      }

      // ── Phase 2: Acquire refresh_token via HTTP (no browser OAuth needed) ──

      var tokenResult = null;
      try {
        tokenResult = await acquireRefreshTokenViaHttp(state, chrome, addLog, sleepWithStop);
      } catch (tokenError) {
        await addLog('Team 邀请：HTTP 凭证获取失败：' + tokenError.message, 'warn');
        await addLog('Team 邀请：将回退到浏览器 OAuth 流程获取凭证。', 'info');
      }

      var completionPayload = {
        teamInviteSent: true,
        teamInviteStatus: lastResult.status,
      };

      if (tokenResult) {
        completionPayload.teamTokenAcquired = true;
        completionPayload.teamAccessToken = tokenResult.accessToken;
        completionPayload.teamRefreshToken = tokenResult.refreshToken;

        // Save tokens to state so subsequent steps can use them
        try {
          await setState({
            refreshToken: tokenResult.refreshToken,
            accessToken: tokenResult.accessToken,
          });
        } catch (setStateErr) {
          await addLog('Team 邀请：保存凭证到状态失败：' + setStateErr.message, 'warn');
        }
      }

      await completeNodeFromBackground('team-invite', completionPayload);
    }

    return { executeTeamInvite };
  }

  return { createTeamInviteExecutor };
});
