(function attachBackgroundTeamInvite(root, factory) {
  root.MultiPageBackgroundTeamInvite = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createTeamInviteModule() {

  const CHATGPT_API = 'https://chatgpt.com/backend-api';
  const AUTH_TOKEN_URL = 'https://auth.openai.com/oauth/token';
  const CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
  const REDIRECT_URI = 'http://localhost:1455/auth/callback';
  const MAX_RETRIES = 3;
  const INVITE_PROPAGATION_DELAY_MS = 4000;

  function normalizeString(value) {
    return String(value || '').trim();
  }

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

  async function refreshAccessToken(refreshToken) {
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      redirect_uri: REDIRECT_URI,
    });
    const resp = await fetch(AUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: body.toString(),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error('Team token refresh failed: HTTP ' + resp.status + ' ' + text.slice(0, 200));
    }
    const data = await resp.json();
    return {
      access_token: data.access_token || '',
      refresh_token: data.refresh_token || refreshToken,
    };
  }

  async function sendInvite(accessToken, workspaceId, email) {
    const resp = await fetch(CHATGPT_API + '/accounts/' + encodeURIComponent(workspaceId) + '/invites', {
      method: 'POST',
      headers: buildAuthHeaders(accessToken, workspaceId),
      body: JSON.stringify({ email_addresses: [email], role: 'standard-user', seat_type: 'usage_based', resend_emails: true }),
    });
    if (resp.status === 200 || resp.status === 201) {
      return { success: true, status: 'invited', message: '邀请已发送' };
    }
    const bodyText = await resp.text().catch(() => '');
    if (resp.status === 409 || resp.status === 422) {
      const lower = bodyText.toLowerCase();
      if (lower.includes('member') || lower.includes('workspace') || lower.includes('already')) {
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

  function createTeamInviteExecutor(deps) {
    const {
      addLog = async () => {},
      completeNodeFromBackground,
      getState = () => ({}),
      sleepWithStop = (ms) => new Promise((r) => setTimeout(r, ms)),
    } = deps || {};

    async function executeTeamInvite(state) {
      if (!state?.teamInviteEnabled) {
        await completeNodeFromBackground('team-invite', { teamInviteSkipped: true });
        return;
      }

      const accessToken = normalizeString(state.teamAccessToken);
      const refreshToken = normalizeString(state.teamRefreshToken);
      const workspaceId = normalizeString(state.teamWorkspaceId);
      const email = normalizeString(state.email);

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

      await addLog('Team 邀请：正在邀请 ' + email + ' 加入工作区 ' + workspaceId + '...', 'info');

      let currentToken = accessToken;
      let lastResult;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        lastResult = await sendInvite(currentToken, workspaceId, email);

        if (lastResult.success) {
          break;
        }

        if (lastResult.status === 'auth_failed' && refreshToken) {
          await addLog('Team 邀请：token 无效，尝试刷新...', 'info');
          try {
            const refreshed = await refreshAccessToken(refreshToken);
            currentToken = refreshed.access_token;
            lastResult = await sendInvite(currentToken, workspaceId, email);
            if (lastResult.success) break;
          } catch (e) {
            await addLog('Team 邀请：token 刷新失败：' + e.message, 'warn');
          }
          break;
        }

        if (lastResult.status === 'rate_limited' && attempt < MAX_RETRIES) {
          const delay = Math.min(18000, Math.pow(2, attempt + 1) * 1000);
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
        await addLog('Team 邀请失败：' + (lastResult?.message || '未知错误') + '，流程将继续（可能需要手机验证）。', 'warn');
      }

      await completeNodeFromBackground('team-invite', {
        teamInviteSent: Boolean(lastResult?.success),
        teamInviteStatus: lastResult?.status || 'unknown',
      });
    }

    return { executeTeamInvite };
  }

  return { createTeamInviteExecutor };
});
