(function attachBackgroundTeamRemove(root, factory) {
  root.MultiPageBackgroundTeamRemove = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createTeamRemoveModule() {

  const CHATGPT_API = 'https://chatgpt.com/backend-api';
  const AUTH_TOKEN_URL = 'https://auth.openai.com/oauth/token';
  const CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
  const REDIRECT_URI = 'http://localhost:1455/auth/callback';

  function normalizeString(value) {
    return String(value || '').trim();
  }

  function buildAuthHeaders(accessToken, workspaceId) {
    return {
      'Accept': 'application/json',
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
    if (!resp.ok) throw new Error('Team token refresh failed: HTTP ' + resp.status);
    const data = await resp.json();
    return { access_token: data.access_token || '', refresh_token: data.refresh_token || refreshToken };
  }

  async function listMembers(accessToken, workspaceId) {
    const allUsers = [];
    let offset = 0;
    while (true) {
      const resp = await fetch(
        CHATGPT_API + '/accounts/' + encodeURIComponent(workspaceId) + '/users?limit=50&offset=' + offset,
        { headers: buildAuthHeaders(accessToken, workspaceId) }
      );
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();
      const items = data.items || [];
      allUsers.push(...items);
      if (items.length < 50) break;
      offset += 50;
    }
    return allUsers;
  }

  async function removeMember(accessToken, workspaceId, userId) {
    const resp = await fetch(
      CHATGPT_API + '/accounts/' + encodeURIComponent(workspaceId) + '/users/' + encodeURIComponent(userId),
      { method: 'DELETE', headers: buildAuthHeaders(accessToken, workspaceId) }
    );
    return resp.status === 200 || resp.status === 204 || resp.status === 404;
  }

  async function revokeInvite(accessToken, workspaceId, email) {
    try {
      const resp = await fetch(
        CHATGPT_API + '/accounts/' + encodeURIComponent(workspaceId) + '/invites',
        {
          method: 'DELETE',
          headers: { ...buildAuthHeaders(accessToken, workspaceId), 'Content-Type': 'application/json' },
          body: JSON.stringify({ email_address: email }),
        }
      );
      return resp.status === 200 || resp.status === 204 || resp.status === 404;
    } catch { return false; }
  }

  function createTeamRemoveExecutor(deps) {
    const {
      addLog = async () => {},
      completeNodeFromBackground,
      getState = () => ({}),
    } = deps || {};

    async function executeTeamRemove(state) {
      if (!state?.teamInviteEnabled) {
        await completeNodeFromBackground('team-remove', { teamRemoveSkipped: true });
        return;
      }

      const accessToken = normalizeString(state.teamAccessToken);
      const refreshToken = normalizeString(state.teamRefreshToken);
      const workspaceId = normalizeString(state.teamWorkspaceId);
      const email = normalizeString(state.email);

      if (!accessToken || !workspaceId || !email) {
        await addLog('Team 移除：配置不完整，跳过。', 'warn');
        await completeNodeFromBackground('team-remove', { teamRemoveSkipped: true });
        return;
      }

      await addLog('Team 移除：正在从工作区移除 ' + email + '...', 'info');

      let currentToken = accessToken;

      try {
        let members;
        try {
          members = await listMembers(currentToken, workspaceId);
        } catch (e) {
          if ((e.message || '').includes('401') || (e.message || '').includes('403')) {
            if (refreshToken) {
              await addLog('Team 移除：token 无效，尝试刷新...', 'info');
              const refreshed = await refreshAccessToken(refreshToken);
              currentToken = refreshed.access_token;
              members = await listMembers(currentToken, workspaceId);
            } else {
              throw e;
            }
          } else {
            throw e;
          }
        }

        const emailLower = email.toLowerCase();
        const target = members.find((m) => (m.email || '').toLowerCase() === emailLower);

        if (target) {
          const removed = await removeMember(currentToken, workspaceId, target.id);
          if (removed) {
            await addLog('Team 移除：已从工作区移除 ' + email, 'ok');
          } else {
            await addLog('Team 移除：移除请求未成功，不影响 OAuth 结果。', 'warn');
          }
        } else {
          // Not in members, try revoke pending invite
          await revokeInvite(currentToken, workspaceId, email);
          await addLog('Team 移除：未找到成员，已尝试撤销邀请。', 'info');
        }
      } catch (e) {
        await addLog('Team 移除失败：' + (e.message || '未知错误') + '，不影响 OAuth 结果。', 'warn');
      }

      await completeNodeFromBackground('team-remove', { teamRemoveDone: true });
    }

    return { executeTeamRemove };
  }

  return { createTeamRemoveExecutor };
});
