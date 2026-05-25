(function attachBackgroundTeamInvite(root, factory) {
  root.MultiPageBackgroundTeamInvite = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createTeamInviteModule() {

  var CHATGPT_API = 'https://chatgpt.com/backend-api';
  var AUTH_BASE = 'https://auth.openai.com';
  var AUTH_TOKEN_URL = AUTH_BASE + '/oauth/token';
  var AUTH_AUTHORIZE_URL = AUTH_BASE + '/oauth/authorize';
  var CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
  var REDIRECT_URI = 'http://localhost:1455/auth/callback';
  var OAUTH_SCOPE = 'openid profile email offline_access';
  var MAX_RETRIES = 3;
  var INVITE_PROPAGATION_DELAY_MS = 4000;
  var OAUTH_TAB_TIMEOUT_MS = 50000;

  function normalizeString(value) {
    return String(value || '').trim();
  }

  // ── PKCE helpers ──

  function generateRandomString(length) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    var array = new Uint8Array(length);
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
    var domains = ['.openai.com', 'auth.openai.com', '.chatgpt.com', 'chatgpt.com'];
    for (var d = 0; d < domains.length; d++) {
      try {
        var cookies = await chrome.cookies.getAll({ domain: domains[d] });
        for (var i = 0; i < cookies.length; i++) {
          if (cookies[i].name === 'oai-did') return cookies[i].value;
        }
      } catch (_) {}
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

  async function getInviteeAccessToken(chrome, addLog) {
    var tabs = await chrome.tabs.query({ url: '*://chatgpt.com/*' });
    if (!tabs || !tabs.length) {
      throw new Error('未找到 ChatGPT 标签页');
    }

    for (var i = 0; i < tabs.length; i++) {
      try {
        var results = await chrome.scripting.executeScript({
          target: { tabId: tabs[i].id },
          func: function () {
            return fetch('/api/auth/session', { credentials: 'include' })
              .then(function (r) { return r.json().catch(function () { return {}; }).then(function (s) { return { ok: r.ok, accessToken: String(s.accessToken || '').trim() }; }); });
          },
        });
        var result = results && results[0] && results[0].result;
        if (result && result.accessToken) {
          return result.accessToken;
        }
      } catch (_) {}
    }

    throw new Error('无法从 ChatGPT 页面获取 accessToken');
  }

  async function acceptInvite(accessToken, workspaceId) {
    var resp = await fetch(CHATGPT_API + '/accounts/' + encodeURIComponent(workspaceId) + '/invites/accept', {
      method: 'POST',
      headers: buildAuthHeaders(accessToken, workspaceId),
      body: JSON.stringify({}),
    });
    if (resp.status === 200 || resp.status === 201 || resp.status === 204) {
      return { success: true };
    }
    var bodyText = await resp.text().catch(function () { return ''; });
    if (resp.status === 404) {
      return { success: false, status: 404, message: '邀请不存在或已过期' };
    }
    if (resp.status === 401 || resp.status === 403) {
      return { success: false, status: resp.status, message: 'invitee token 无效或已过期' };
    }
    return { success: false, status: resp.status, message: 'HTTP ' + resp.status + ': ' + bodyText.slice(0, 200) };
  }

  async function allocateViaCpa(cpaUrl, cpaKey, accessToken, did, proxy, timeoutMs) {
    var origin = cpaUrl.replace(/\/+$/, '');
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, timeoutMs || 60000);
    try {
      var resp = await fetch(origin + '/api/team/sys-allocate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + cpaKey,
        },
        body: JSON.stringify({ access_token: accessToken, did: did, proxy: proxy || '' }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      return await resp.json();
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
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

  // ── Workspace selection via API (single POST, no redirect chain) ──

  async function selectPersonalWorkspace(chrome, addLog) {
    var did = await getDidFromCookies(chrome);
    var cookieString = await getCookieString(chrome, [
      '.openai.com', 'auth.openai.com',
      '.chatgpt.com', 'chatgpt.com',
    ]);

    var authCookie = '';
    var authDomains = ['.openai.com', 'auth.openai.com', '.chatgpt.com', 'chatgpt.com'];
    for (var di = 0; di < authDomains.length && !authCookie; di++) {
      try {
        var domainCookies = await chrome.cookies.getAll({ domain: authDomains[di] });
        for (var ci = 0; ci < domainCookies.length; ci++) {
          if (domainCookies[ci].name === 'oai-client-auth-session') {
            authCookie = domainCookies[ci].value;
            break;
          }
        }
      } catch (_) {}
    }

    var workspaces = parseWorkspacesFromAuthCookie(authCookie);
    if (workspaces.length === 0) return null;

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
    if (!targetWorkspaceId) return null;

    await addLog('Team 邀请：正在选择 Personal 工作区（' + targetWorkspaceId + '）...', 'info');

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

    return String(selectData.continue_url || '').trim() || null;
  }

  // ── Tab-based OAuth token acquisition ──
  // Uses a browser tab so cookies are maintained across redirects.

  function waitForCodeViaNavigation(chrome, tabId, timeoutMs) {
    return new Promise(function (resolve) {
      var timer = setTimeout(function () {
        try { chrome.webNavigation.onBeforeNavigate.removeListener(onNav); } catch (_) {}
        resolve('');
      }, timeoutMs);

      function onNav(details) {
        if (details.tabId !== tabId || !details.url) return;
        if (details.url.indexOf('localhost:1455') === -1) return;
        if (details.url.indexOf('code=') === -1) return;

        clearTimeout(timer);
        try { chrome.webNavigation.onBeforeNavigate.removeListener(onNav); } catch (_) {}

        try {
          var urlObj = new URL(details.url);
          resolve(urlObj.searchParams.get('code') || '');
        } catch (_) {
          resolve('');
        }
      }

      chrome.webNavigation.onBeforeNavigate.addListener(onNav);
    });
  }

  async function acquireRefreshTokenViaTab(state, chrome, addLog, sleepWithStop) {
    await addLog('Team 邀请：正在通过浏览器标签获取凭证...', 'info');

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

    // Start listening BEFORE navigating so we don't miss early redirects
    var tab = await chrome.tabs.create({ url: 'about:blank', active: false });
    await addLog('Team 邀请：已创建 OAuth 标签（' + tab.id + '），正在等待回调...', 'info');

    var navPromise = waitForCodeViaNavigation(chrome, tab.id, OAUTH_TAB_TIMEOUT_MS);

    // Navigate the tab to the OAuth authorize URL
    await chrome.tabs.update(tab.id, { url: authUrl });

    var code = await navPromise;

    // If no code yet, the tab might be stuck on workspace selection.
    // Try API-based workspace selection, then navigate tab to continue_url.
    if (!code) {
      await addLog('Team 邀请：OAuth 未自动回调，尝试通过 API 选择工作区后继续...', 'info');

      try {
        var continueUrl = await selectPersonalWorkspace(chrome, addLog);
        if (continueUrl) {
          var navPromise2 = waitForCodeViaNavigation(chrome, tab.id, 30000);
          await chrome.tabs.update(tab.id, { url: continueUrl });
          code = await navPromise2;
        }
      } catch (wsErr) {
        await addLog('Team 邀请：工作区选择失败：' + wsErr.message, 'warn');
      }
    }

    // Close the OAuth tab
    try { await chrome.tabs.remove(tab.id); } catch (_) {}

    if (!code) {
      throw new Error('浏览器 OAuth 超时，未获取到授权码');
    }

    await addLog('Team 邀请：已获取授权码，正在换取 refresh_token...', 'info');
    var tokenData = await exchangeCodeForTokens(code, codeVerifier);

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

      // ── Phase 1.5: Accept the invite using invitee's session ──

      var inviteeToken = '';
      try {
        inviteeToken = await getInviteeAccessToken(chrome, addLog);
        await addLog('Team 邀请：已获取注册账号的 accessToken，正在接受邀请...', 'info');
      } catch (tokenErr) {
        await addLog('Team 邀请：获取注册账号 accessToken 失败：' + tokenErr.message, 'warn');
      }

      if (inviteeToken) {
        try {
          var acceptResult = await acceptInvite(inviteeToken, workspaceId);
          if (acceptResult.success) {
            await addLog('Team 邀请：邀请已接受，账号已加入 Team 工作区！', 'ok');
            await sleepWithStop(2000);
          } else {
            await addLog('Team 邀请：接受邀请失败：' + acceptResult.message, 'warn');
          }
        } catch (acceptErr) {
          await addLog('Team 邀请：接受邀请异常：' + acceptErr.message, 'warn');
        }
      }

      // ── Phase 2: Acquire refresh_token ──
      // 优先走 CPA sys_node_allocate，失败则 fallback 到 tab OAuth

      var tokenResult = null;

      // Phase 2a: CPA sys-allocate
      var cpaUrl = normalizeString(state.regToolUrl);
      var cpaKey = normalizeString(state.regToolToken);
      var proxy = normalizeString(state.proxy || state.ipProxy || '');

      if (inviteeToken && cpaUrl && cpaKey) {
        var did = '';
        try { did = await getDidFromCookies(chrome); } catch (_) {}

        if (did) {
          await addLog('Team 邀请：正在通过 CPA sys_node_allocate 分配团队并获取凭证...', 'info');
          try {
            var cpaResult = await allocateViaCpa(cpaUrl, cpaKey, inviteeToken, did, proxy, 90000);
            if (cpaResult && cpaResult.status === 'success' && cpaResult.data) {
              var d = cpaResult.data;
              if (d.refresh_token) {
                tokenResult = {
                  accessToken: d.access_token || '',
                  refreshToken: d.refresh_token,
                  email: d.email || state.email || '',
                  teamTokenAcquired: true,
                };
                await addLog('Team 邀请：CPA sys_node_allocate 成功，refresh_token 获取成功！', 'ok');
              } else {
                await addLog('Team 邀请：CPA 返回成功但缺少 refresh_token：' + (cpaResult.message || ''), 'warn');
              }
            } else {
              await addLog('Team 邀请：CPA sys_node_allocate 失败：' + ((cpaResult && cpaResult.message) || '未知错误'), 'warn');
            }
          } catch (cpaErr) {
            await addLog('Team 邀请：CPA 调用异常：' + cpaErr.message, 'warn');
          }
        } else {
          await addLog('Team 邀请：未获取到 did，跳过 CPA sys_node_allocate。', 'warn');
        }
      }

      // Phase 2b: Fallback to tab-based OAuth
      if (!tokenResult) {
        if (!inviteeToken || !cpaUrl || !cpaKey) {
          await addLog('Team 邀请：CPA 未配置或无 accessToken，尝试浏览器 OAuth...', 'info');
        }
        try {
          tokenResult = await acquireRefreshTokenViaTab(state, chrome, addLog, sleepWithStop);
        } catch (tokenError) {
          await addLog('Team 邀请：浏览器 OAuth 也失败：' + tokenError.message, 'warn');
        }
      }

      var completionPayload = {
        teamInviteSent: true,
        teamInviteStatus: lastResult.status,
      };

      if (inviteeToken) {
        completionPayload.teamInviteAccepted = true;
        completionPayload.inviteeAccessToken = inviteeToken;
      }

      if (tokenResult) {
        completionPayload.teamTokenAcquired = true;
        completionPayload.teamAccessToken = tokenResult.accessToken;
        completionPayload.teamRefreshToken = tokenResult.refreshToken;

        try {
          await setState({
            refreshToken: tokenResult.refreshToken,
            accessToken: tokenResult.accessToken,
          });
        } catch (setStateErr) {
          await addLog('Team 邀请：保存凭证到状态失败：' + setStateErr.message, 'warn');
        }
      } else if (inviteeToken) {
        try {
          await setState({ accessToken: inviteeToken });
        } catch (_) {}
      }

      await completeNodeFromBackground('team-invite', completionPayload);
    }

    return { executeTeamInvite };
  }

  return { createTeamInviteExecutor };
});
