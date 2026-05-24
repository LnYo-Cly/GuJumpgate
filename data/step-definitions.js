(function attachStepDefinitions(root, factory) {
  root.MultiPageStepDefinitions = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createStepDefinitionsModule() {
  const DEFAULT_ACTIVE_FLOW_ID = 'openai';
  const PLUS_PAYMENT_METHOD_PAYPAL = 'paypal';
  const PLUS_PAYMENT_METHOD_GOPAY = 'gopay';
  const PLUS_PAYMENT_METHOD_GPC_HELPER = 'gpc-helper';
  const PLUS_PAYMENT_STEP_KEY = 'paypal-approve';
  const LOCAL_CPA_JSON_NO_RT_PANEL_MODE = 'local-cpa-json-no-rt';
  const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
  const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
  const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
  const SIGNUP_METHOD_EMAIL = 'email';
  const SIGNUP_METHOD_PHONE = 'phone';

  const NORMAL_PREFIX_STEP_DEFINITIONS = [
    { id: 1, order: 10, key: 'open-chatgpt', title: '打开 ChatGPT 官网', sourceId: 'chatgpt', driverId: null, command: 'open-chatgpt' },
    { id: 2, order: 20, key: 'submit-signup-email', title: '注册并输入邮箱', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'submit-signup-email' },
    { id: 3, order: 30, key: 'fill-password', title: '填写密码并继续', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'fill-password' },
    { id: 4, order: 40, key: 'fetch-signup-code', title: '获取注册验证码', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'submit-verification-code', mailRuleId: 'openai-signup-code' },
    { id: 5, order: 50, key: 'fill-profile', title: '填写姓名和生日', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'fill-profile' },
    { id: 6, order: 60, key: 'wait-registration-success', title: '等待注册成功', sourceId: 'chatgpt', driverId: null, command: 'wait-registration-success' },
    { id: 7, order: 70, key: 'plus-checkout-create', title: '创建 Plus Checkout', sourceId: 'plus-checkout', driverId: 'content/plus-checkout', command: 'plus-checkout-create' },
    { id: 8, order: 80, key: 'plus-checkout-billing', title: '填写账单并提交订单', sourceId: 'plus-checkout', driverId: 'content/plus-checkout', command: 'plus-checkout-billing' },
    { id: 9, order: 90, key: 'paypal-approve', title: 'PayPal 登录与授权', sourceId: 'paypal-flow', driverId: 'content/paypal-flow', command: 'paypal-approve' },
    { id: 10, order: 100, key: 'plus-checkout-return', title: '订阅回跳确认', sourceId: 'plus-checkout', driverId: 'content/plus-checkout', command: 'plus-checkout-return' },
  ];

  const PLUS_PAYPAL_PREFIX_STEP_DEFINITIONS = [
    { id: 1, order: 10, key: 'open-chatgpt', title: '打开 ChatGPT 官网', sourceId: 'chatgpt', driverId: null, command: 'open-chatgpt' },
    { id: 2, order: 20, key: 'submit-signup-email', title: '注册并输入邮箱', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'submit-signup-email' },
    { id: 3, order: 30, key: 'fill-password', title: '填写密码并继续', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'fill-password' },
    { id: 4, order: 40, key: 'fetch-signup-code', title: '获取注册验证码', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'submit-verification-code', mailRuleId: 'openai-signup-code' },
    { id: 5, order: 50, key: 'fill-profile', title: '填写姓名和生日', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'fill-profile' },
    { id: 6, order: 60, key: 'plus-checkout-create', title: '创建 Plus Checkout', sourceId: 'plus-checkout', driverId: 'content/plus-checkout', command: 'plus-checkout-create' },
    { id: 7, order: 70, key: 'plus-checkout-billing', title: '填写账单并提交订单', sourceId: 'plus-checkout', driverId: 'content/plus-checkout', command: 'plus-checkout-billing' },
    { id: 8, order: 80, key: 'paypal-approve', title: 'PayPal 登录与授权', sourceId: 'paypal-flow', driverId: 'content/paypal-flow', command: 'paypal-approve' },
    { id: 9, order: 90, key: 'plus-checkout-return', title: '订阅回跳确认', sourceId: 'plus-checkout', driverId: 'content/plus-checkout', command: 'plus-checkout-return' },
  ];
  const PLUS_PAYPAL_HOSTED_CHECKOUT_PREFIX_STEP_DEFINITIONS = PLUS_PAYPAL_PREFIX_STEP_DEFINITIONS.slice(0, 6);
  const LOCAL_CPA_JSON_NO_RT_EXPORT_STEP_DEFINITION = {
    id: 7,
    order: 70,
    key: 'local-cpa-json-export',
    title: '导出本地CPA JSON',
    sourceId: 'chatgpt',
    driverId: null,
    command: 'local-cpa-json-export',
  };

  const PLUS_GOPAY_PREFIX_STEP_DEFINITIONS = [
    { id: 1, order: 10, key: 'open-chatgpt', title: '打开 ChatGPT 官网', sourceId: 'chatgpt', driverId: null, command: 'open-chatgpt' },
    { id: 2, order: 20, key: 'submit-signup-email', title: '注册并输入邮箱', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'submit-signup-email' },
    { id: 3, order: 30, key: 'fill-password', title: '填写密码并继续', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'fill-password' },
    { id: 4, order: 40, key: 'fetch-signup-code', title: '获取注册验证码', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'submit-verification-code', mailRuleId: 'openai-signup-code' },
    { id: 5, order: 50, key: 'fill-profile', title: '填写姓名和生日', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'fill-profile' },
    { id: 6, order: 60, key: 'plus-checkout-create', title: '打开 GoPay 订阅页', sourceId: 'plus-checkout', driverId: 'content/plus-checkout', command: 'plus-checkout-create' },
    { id: 7, order: 70, key: 'gopay-subscription-confirm', title: '等待 GoPay 订阅确认', sourceId: 'gopay-flow', driverId: 'content/gopay-flow', command: 'gopay-subscription-confirm' },
  ];

  const PLUS_GPC_PREFIX_STEP_DEFINITIONS = [
    { id: 1, order: 10, key: 'open-chatgpt', title: '打开 ChatGPT 官网', sourceId: 'chatgpt', driverId: null, command: 'open-chatgpt' },
    { id: 2, order: 20, key: 'submit-signup-email', title: '注册并输入邮箱', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'submit-signup-email' },
    { id: 3, order: 30, key: 'fill-password', title: '填写密码并继续', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'fill-password' },
    { id: 4, order: 40, key: 'fetch-signup-code', title: '获取注册验证码', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'submit-verification-code', mailRuleId: 'openai-signup-code' },
    { id: 5, order: 50, key: 'fill-profile', title: '填写姓名和生日', sourceId: 'openai-auth', driverId: 'content/signup-page', command: 'fill-profile' },
    { id: 6, order: 60, key: 'plus-checkout-create', title: '创建 GPC 订单', sourceId: 'plus-checkout', driverId: 'content/plus-checkout', command: 'plus-checkout-create' },
    { id: 7, order: 70, key: 'plus-checkout-billing', title: '等待 GPC 任务完成', sourceId: 'plus-checkout', driverId: 'content/plus-checkout', command: 'plus-checkout-billing' },
  ];

  function isPhoneSignupReloginAfterBindEmailEnabled(options = {}) {
    return Boolean(options?.phoneSignupReloginAfterBindEmailEnabled);
  }

  function createOpenAiAuthTail(startId, startOrder, signupMethod = SIGNUP_METHOD_EMAIL, options = {}) {
    let nextId = Number(startId) || 7;
    let nextOrder = Number(startOrder) || nextId * 10;
    const useTeam = Boolean(options?.teamInviteEnabled);

    function step(key, title, sourceId, driverId, command, extra) {
      return { id: nextId++, order: nextOrder, key, title, sourceId, driverId, command, ...extra };
    }
    function advanceOrder() { nextOrder += 10; }

    const steps = [];

    if (useTeam) {
      steps.push(step('team-invite', 'Team 邀请（跳过验证）', 'openai-auth', null, 'team-invite'));
      advanceOrder();
    }

    steps.push(step('oauth-login', '刷新 OAuth 并登录', 'openai-auth', 'content/signup-page', 'oauth-login'));
    advanceOrder();
    steps.push(step('fetch-login-code', '获取登录验证码', 'openai-auth', 'content/signup-page', 'submit-verification-code', { mailRuleId: 'openai-login-code' }));
    advanceOrder();

    if (signupMethod === SIGNUP_METHOD_PHONE) {
      if (isPhoneSignupReloginAfterBindEmailEnabled(options)) {
        steps.push(step('bind-email', '绑定邮箱', 'openai-auth', 'content/signup-page', 'bind-email'));
        advanceOrder();
        steps.push(step('fetch-bind-email-code', '获取绑定邮箱验证码', 'openai-auth', 'content/signup-page', 'fetch-bind-email-code', { mailRuleId: 'openai-login-code' }));
        advanceOrder();
        steps.push(step('relogin-bound-email', '绑定邮箱后刷新 OAuth 并登录（邮箱）', 'openai-auth', 'content/signup-page', 'oauth-login'));
        advanceOrder();
        steps.push(step('fetch-bound-email-login-code', '获取登录验证码（邮箱）', 'openai-auth', 'content/signup-page', 'submit-verification-code', { mailRuleId: 'openai-login-code' }));
        advanceOrder();
        steps.push(step('post-bound-email-phone-verification', '手机号验证', 'openai-auth', 'content/signup-page', 'post-login-phone-verification'));
        advanceOrder();
        steps.push(step('confirm-oauth', '自动确认 OAuth', 'openai-auth', 'content/signup-page', 'confirm-oauth'));
        advanceOrder();
        if (useTeam) {
          steps.push(step('team-remove', 'Team 移除账号', 'openai-auth', null, 'team-remove'));
          advanceOrder();
        }
        steps.push(step('platform-verify', '平台回调验证', 'platform-panel', 'content/platform-panel', 'platform-verify'));
        return steps;
      }
      steps.push(step('bind-email', '绑定邮箱', 'openai-auth', 'content/signup-page', 'bind-email'));
      advanceOrder();
      steps.push(step('fetch-bind-email-code', '获取绑定邮箱验证码', 'openai-auth', 'content/signup-page', 'fetch-bind-email-code', { mailRuleId: 'openai-login-code' }));
      advanceOrder();
      steps.push(step('confirm-oauth', '自动确认 OAuth', 'openai-auth', 'content/signup-page', 'confirm-oauth'));
      advanceOrder();
      if (useTeam) {
        steps.push(step('team-remove', 'Team 移除账号', 'openai-auth', null, 'team-remove'));
        advanceOrder();
      }
      steps.push(step('platform-verify', '平台回调验证', 'platform-panel', 'content/platform-panel', 'platform-verify'));
      return steps;
    }

    steps.push(step('post-login-phone-verification', '手机号验证', 'openai-auth', 'content/signup-page', 'post-login-phone-verification'));
    advanceOrder();
    steps.push(step('confirm-oauth', '自动确认 OAuth', 'openai-auth', 'content/signup-page', 'confirm-oauth'));
    advanceOrder();
    if (useTeam) {
      steps.push(step('team-remove', 'Team 移除账号', 'openai-auth', null, 'team-remove'));
      advanceOrder();
    }
    steps.push(step('platform-verify', '平台回调验证', 'platform-panel', 'content/platform-panel', 'platform-verify'));
    return steps;
  }

  function createSub2ApiSessionImportTail(startId, startOrder) {
    const id = Number(startId) || 10;
    const order = Number(startOrder) || id * 10;
    return [{
      id,
      order,
      key: 'sub2api-session-import',
      title: '导入当前 ChatGPT 会话到 SUB2API',
      sourceId: 'sub2api-panel',
      driverId: 'background/sub2api-session-import',
      command: 'sub2api-session-import',
    }];
  }

  function createCpaSessionImportTail(startId, startOrder) {
    const id = Number(startId) || 10;
    const order = Number(startOrder) || id * 10;
    return [{
      id,
      order,
      key: 'cpa-session-import',
      title: '导入当前 ChatGPT 会话到 CPA',
      sourceId: 'vps-panel',
      driverId: 'background/cpa-session-import',
      command: 'cpa-session-import',
    }];
  }

  function normalizePlusAccountAccessStrategy(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION) {
      return PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION;
    }
    if (normalized === PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION) {
      return PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION;
    }
    return PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
  }

  function resolvePlusSessionImportTail(options = {}, signupMethod = SIGNUP_METHOD_EMAIL) {
    if (signupMethod !== SIGNUP_METHOD_EMAIL) {
      return null;
    }
    const strategy = normalizePlusAccountAccessStrategy(options?.plusAccountAccessStrategy);
    if (strategy === PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION) {
      return createSub2ApiSessionImportTail;
    }
    if (strategy === PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION) {
      return createCpaSessionImportTail;
    }
    return null;
  }

  function createOpenAiSteps(prefixSteps, startId, startOrder, signupMethod = SIGNUP_METHOD_EMAIL, options = {}) {
    const sessionTailFactory = resolvePlusSessionImportTail(options, signupMethod);
    const tailSteps = sessionTailFactory
      ? sessionTailFactory(startId, startOrder)
      : createOpenAiAuthTail(startId, startOrder, signupMethod, options);
    return [
      ...prefixSteps,
      ...tailSteps,
    ];
  }

  function createHostedCheckoutAuthTail(startId, startOrder, signupMethod = SIGNUP_METHOD_EMAIL, options = {}) {
    let nextId = Number(startId) || 7;
    let nextOrder = Number(startOrder) || nextId * 10;
    const useTeam = Boolean(options?.teamInviteEnabled);

    function step(key, title, sourceId, driverId, command, extra) {
      return { id: nextId++, order: nextOrder, key, title, sourceId, driverId, command, ...extra };
    }
    function advanceOrder() { nextOrder += 10; }

    const steps = [];

    if (useTeam) {
      steps.push(step('team-invite', 'Team 邀请（跳过验证）', 'openai-auth', null, 'team-invite'));
      advanceOrder();
    }

    steps.push(step('oauth-login', '刷新 OAuth 并登录', 'openai-auth', 'content/signup-page', 'oauth-login'));
    advanceOrder();
    steps.push(step('fetch-login-code', '获取登录验证码', 'openai-auth', 'content/signup-page', 'submit-verification-code', { mailRuleId: 'openai-login-code' }));
    advanceOrder();

    if (signupMethod === SIGNUP_METHOD_PHONE) {
      if (isPhoneSignupReloginAfterBindEmailEnabled(options)) {
        steps.push(step('bind-email', '绑定邮箱', 'openai-auth', 'content/signup-page', 'bind-email'));
        advanceOrder();
        steps.push(step('fetch-bind-email-code', '获取绑定邮箱验证码', 'openai-auth', 'content/signup-page', 'fetch-bind-email-code', { mailRuleId: 'openai-login-code' }));
        advanceOrder();
        steps.push(step('relogin-bound-email', '绑定邮箱后刷新 OAuth 并登录（邮箱）', 'openai-auth', 'content/signup-page', 'oauth-login'));
        advanceOrder();
        steps.push(step('fetch-bound-email-login-code', '获取登录验证码（邮箱）', 'openai-auth', 'content/signup-page', 'submit-verification-code', { mailRuleId: 'openai-login-code' }));
        advanceOrder();
        steps.push(step('confirm-oauth', '自动确认 OAuth', 'openai-auth', 'content/signup-page', 'confirm-oauth'));
        advanceOrder();
        if (useTeam) {
          steps.push(step('team-remove', 'Team 移除账号', 'openai-auth', null, 'team-remove'));
          advanceOrder();
        }
        steps.push(step('platform-verify', '平台回调验证', 'platform-panel', 'content/platform-panel', 'platform-verify'));
        return steps;
      }
      steps.push(step('bind-email', '绑定邮箱', 'openai-auth', 'content/signup-page', 'bind-email'));
      advanceOrder();
      steps.push(step('fetch-bind-email-code', '获取绑定邮箱验证码', 'openai-auth', 'content/signup-page', 'fetch-bind-email-code', { mailRuleId: 'openai-login-code' }));
      advanceOrder();
      steps.push(step('confirm-oauth', '自动确认 OAuth', 'openai-auth', 'content/signup-page', 'confirm-oauth'));
      advanceOrder();
      if (useTeam) {
        steps.push(step('team-remove', 'Team 移除账号', 'openai-auth', null, 'team-remove'));
        advanceOrder();
      }
      steps.push(step('platform-verify', '平台回调验证', 'platform-panel', 'content/platform-panel', 'platform-verify'));
      return steps;
    }

    steps.push(step('confirm-oauth', '自动确认 OAuth', 'openai-auth', 'content/signup-page', 'confirm-oauth'));
    advanceOrder();
    if (useTeam) {
      steps.push(step('team-remove', 'Team 移除账号', 'openai-auth', null, 'team-remove'));
      advanceOrder();
    }
    steps.push(step('platform-verify', '平台回调验证', 'platform-panel', 'content/platform-panel', 'platform-verify'));
    return steps;
  }

  function createHostedCheckoutSteps(prefixSteps, startId, startOrder, signupMethod = SIGNUP_METHOD_EMAIL, options = {}) {
    const sessionTailFactory = resolvePlusSessionImportTail(options, signupMethod);
    const tailSteps = sessionTailFactory
      ? sessionTailFactory(startId, startOrder)
      : createHostedCheckoutAuthTail(startId, startOrder, signupMethod, options);
    return [
      ...prefixSteps,
      ...tailSteps,
    ];
  }

  const NORMAL_STEP_DEFINITIONS = createOpenAiSteps(NORMAL_PREFIX_STEP_DEFINITIONS, 11, 110, SIGNUP_METHOD_EMAIL);
  const NORMAL_PHONE_STEP_DEFINITIONS = createOpenAiSteps(NORMAL_PREFIX_STEP_DEFINITIONS, 11, 110, SIGNUP_METHOD_PHONE);
  const NORMAL_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS = createOpenAiSteps(NORMAL_PREFIX_STEP_DEFINITIONS, 11, 110, SIGNUP_METHOD_PHONE, { phoneSignupReloginAfterBindEmailEnabled: true });
  const PLUS_PAYPAL_STEP_DEFINITIONS = createOpenAiSteps(PLUS_PAYPAL_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_EMAIL);
  const PLUS_PAYPAL_SUB2API_SESSION_STEP_DEFINITIONS = createOpenAiSteps(
    PLUS_PAYPAL_PREFIX_STEP_DEFINITIONS,
    10,
    100,
    SIGNUP_METHOD_EMAIL,
    { plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION }
  );
  const PLUS_PAYPAL_CPA_SESSION_STEP_DEFINITIONS = createOpenAiSteps(
    PLUS_PAYPAL_PREFIX_STEP_DEFINITIONS,
    10,
    100,
    SIGNUP_METHOD_EMAIL,
    { plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION }
  );
  const PLUS_PAYPAL_PHONE_STEP_DEFINITIONS = createOpenAiSteps(PLUS_PAYPAL_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_PHONE);
  const PLUS_PAYPAL_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS = createOpenAiSteps(PLUS_PAYPAL_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_PHONE, { phoneSignupReloginAfterBindEmailEnabled: true });
  const PLUS_PAYPAL_HOSTED_CHECKOUT_STEP_DEFINITIONS = createHostedCheckoutSteps(PLUS_PAYPAL_HOSTED_CHECKOUT_PREFIX_STEP_DEFINITIONS, 7, 70, SIGNUP_METHOD_EMAIL);
  const PLUS_PAYPAL_HOSTED_CHECKOUT_SUB2API_SESSION_STEP_DEFINITIONS = createHostedCheckoutSteps(
    PLUS_PAYPAL_HOSTED_CHECKOUT_PREFIX_STEP_DEFINITIONS,
    7,
    70,
    SIGNUP_METHOD_EMAIL,
    { plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION }
  );
  const PLUS_PAYPAL_HOSTED_CHECKOUT_CPA_SESSION_STEP_DEFINITIONS = createHostedCheckoutSteps(
    PLUS_PAYPAL_HOSTED_CHECKOUT_PREFIX_STEP_DEFINITIONS,
    7,
    70,
    SIGNUP_METHOD_EMAIL,
    { plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION }
  );
  const PLUS_PAYPAL_HOSTED_CHECKOUT_PHONE_STEP_DEFINITIONS = createHostedCheckoutSteps(PLUS_PAYPAL_HOSTED_CHECKOUT_PREFIX_STEP_DEFINITIONS, 7, 70, SIGNUP_METHOD_PHONE);
  const PLUS_PAYPAL_HOSTED_CHECKOUT_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS = createHostedCheckoutSteps(PLUS_PAYPAL_HOSTED_CHECKOUT_PREFIX_STEP_DEFINITIONS, 7, 70, SIGNUP_METHOD_PHONE, { phoneSignupReloginAfterBindEmailEnabled: true });
  const PLUS_GOPAY_STEP_DEFINITIONS = createOpenAiSteps(PLUS_GOPAY_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_EMAIL);
  const PLUS_GOPAY_SUB2API_SESSION_STEP_DEFINITIONS = createOpenAiSteps(
    PLUS_GOPAY_PREFIX_STEP_DEFINITIONS,
    10,
    100,
    SIGNUP_METHOD_EMAIL,
    { plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION }
  );
  const PLUS_GOPAY_CPA_SESSION_STEP_DEFINITIONS = createOpenAiSteps(
    PLUS_GOPAY_PREFIX_STEP_DEFINITIONS,
    10,
    100,
    SIGNUP_METHOD_EMAIL,
    { plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION }
  );
  const PLUS_GOPAY_PHONE_STEP_DEFINITIONS = createOpenAiSteps(PLUS_GOPAY_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_PHONE);
  const PLUS_GOPAY_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS = createOpenAiSteps(PLUS_GOPAY_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_PHONE, { phoneSignupReloginAfterBindEmailEnabled: true });
  const PLUS_GPC_STEP_DEFINITIONS = createOpenAiSteps(PLUS_GPC_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_EMAIL);
  const PLUS_GPC_SUB2API_SESSION_STEP_DEFINITIONS = createOpenAiSteps(
    PLUS_GPC_PREFIX_STEP_DEFINITIONS,
    10,
    100,
    SIGNUP_METHOD_EMAIL,
    { plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION }
  );
  const PLUS_GPC_CPA_SESSION_STEP_DEFINITIONS = createOpenAiSteps(
    PLUS_GPC_PREFIX_STEP_DEFINITIONS,
    10,
    100,
    SIGNUP_METHOD_EMAIL,
    { plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION }
  );
  const PLUS_GPC_PHONE_STEP_DEFINITIONS = createOpenAiSteps(PLUS_GPC_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_PHONE);
  const PLUS_GPC_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS = createOpenAiSteps(PLUS_GPC_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_PHONE, { phoneSignupReloginAfterBindEmailEnabled: true });

  const PHONE_SIGNUP_TITLE_OVERRIDES = Object.freeze({
    'submit-signup-email': '注册并输入手机号',
    'fetch-signup-code': '获取手机验证码',
  });

  function isPlusModeEnabled(options = {}) {
    return Boolean(options?.plusModeEnabled || options?.plusMode);
  }

  function shouldTreatHostedCheckoutAsFinalStep(options = {}) {
    if (!isPlusModeEnabled(options)) {
      return false;
    }
    const paymentMethod = normalizePlusPaymentMethod(options?.plusPaymentMethod || options?.paymentMethod);
    if (paymentMethod !== PLUS_PAYMENT_METHOD_PAYPAL) {
      return false;
    }
    return options?.plusHostedCheckoutIsFinalStep !== false;
  }

  function normalizePlusPaymentMethod(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === PLUS_PAYMENT_METHOD_GPC_HELPER) {
      return PLUS_PAYMENT_METHOD_GPC_HELPER;
    }
    return normalized === PLUS_PAYMENT_METHOD_GOPAY ? PLUS_PAYMENT_METHOD_GOPAY : PLUS_PAYMENT_METHOD_PAYPAL;
  }

  function normalizeSignupMethod(value = '') {
    return String(value || '').trim().toLowerCase() === SIGNUP_METHOD_PHONE
      ? SIGNUP_METHOD_PHONE
      : SIGNUP_METHOD_EMAIL;
  }

  function normalizeActiveFlowId(value = '', fallback = DEFAULT_ACTIVE_FLOW_ID) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized) {
      return normalized;
    }
    const fallbackValue = String(fallback || '').trim().toLowerCase();
    return fallbackValue || DEFAULT_ACTIVE_FLOW_ID;
  }

  function getResolvedSignupMethod(options = {}) {
    return normalizeSignupMethod(options?.resolvedSignupMethod || options?.signupMethod);
  }

  function getOpenAiModeStepDefinitions(options = {}) {
    const useTeam = Boolean(options?.teamInviteEnabled);
    const panelMode = String(options?.panelMode || '').trim().toLowerCase();
    const signupMethod = getResolvedSignupMethod(options);
    const reloginAfterBindEmail = signupMethod === SIGNUP_METHOD_PHONE
      && isPhoneSignupReloginAfterBindEmailEnabled(options);

    // When team is enabled, dynamically rebuild steps with team-invite/team-remove injected
    if (useTeam) {
      const teamOpts = { ...options, teamInviteEnabled: true };
      if (panelMode === LOCAL_CPA_JSON_NO_RT_PANEL_MODE) {
        return [
          ...PLUS_PAYPAL_HOSTED_CHECKOUT_PREFIX_STEP_DEFINITIONS,
          LOCAL_CPA_JSON_NO_RT_EXPORT_STEP_DEFINITION,
        ];
      }
      if (!isPlusModeEnabled(teamOpts)) {
        if (signupMethod === SIGNUP_METHOD_PHONE) {
          return reloginAfterBindEmail
            ? createOpenAiSteps(NORMAL_PREFIX_STEP_DEFINITIONS, 11, 110, SIGNUP_METHOD_PHONE, { ...teamOpts, phoneSignupReloginAfterBindEmailEnabled: true })
            : createOpenAiSteps(NORMAL_PREFIX_STEP_DEFINITIONS, 11, 110, SIGNUP_METHOD_PHONE, teamOpts);
        }
        return createOpenAiSteps(NORMAL_PREFIX_STEP_DEFINITIONS, 11, 110, SIGNUP_METHOD_EMAIL, teamOpts);
      }
      const pm = normalizePlusPaymentMethod(teamOpts?.plusPaymentMethod || teamOpts?.paymentMethod);
      const pas = normalizePlusAccountAccessStrategy(teamOpts?.plusAccountAccessStrategy);
      if (pm === PLUS_PAYMENT_METHOD_GPC_HELPER) {
        if (signupMethod === SIGNUP_METHOD_PHONE) {
          return reloginAfterBindEmail
            ? createOpenAiSteps(PLUS_GPC_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_PHONE, { ...teamOpts, phoneSignupReloginAfterBindEmailEnabled: true })
            : createOpenAiSteps(PLUS_GPC_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_PHONE, teamOpts);
        }
        if (pas === PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION) {
          return createOpenAiSteps(PLUS_GPC_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_EMAIL, { ...teamOpts, plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION });
        }
        if (pas === PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION) {
          return createOpenAiSteps(PLUS_GPC_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_EMAIL, { ...teamOpts, plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION });
        }
        return createOpenAiSteps(PLUS_GPC_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_EMAIL, teamOpts);
      }
      if (pm === PLUS_PAYMENT_METHOD_GOPAY) {
        if (signupMethod === SIGNUP_METHOD_PHONE) {
          return reloginAfterBindEmail
            ? createOpenAiSteps(PLUS_GOPAY_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_PHONE, { ...teamOpts, phoneSignupReloginAfterBindEmailEnabled: true })
            : createOpenAiSteps(PLUS_GOPAY_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_PHONE, teamOpts);
        }
        if (pas === PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION) {
          return createOpenAiSteps(PLUS_GOPAY_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_EMAIL, { ...teamOpts, plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION });
        }
        if (pas === PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION) {
          return createOpenAiSteps(PLUS_GOPAY_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_EMAIL, { ...teamOpts, plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION });
        }
        return createOpenAiSteps(PLUS_GOPAY_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_EMAIL, teamOpts);
      }
      if (shouldTreatHostedCheckoutAsFinalStep({ ...teamOpts, plusModeEnabled: true, plusPaymentMethod: pm })) {
        if (signupMethod === SIGNUP_METHOD_PHONE) {
          return reloginAfterBindEmail
            ? createHostedCheckoutSteps(PLUS_PAYPAL_HOSTED_CHECKOUT_PREFIX_STEP_DEFINITIONS, 7, 70, SIGNUP_METHOD_PHONE, { ...teamOpts, phoneSignupReloginAfterBindEmailEnabled: true })
            : createHostedCheckoutSteps(PLUS_PAYPAL_HOSTED_CHECKOUT_PREFIX_STEP_DEFINITIONS, 7, 70, SIGNUP_METHOD_PHONE, teamOpts);
        }
        if (pas === PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION) {
          return createHostedCheckoutSteps(PLUS_PAYPAL_HOSTED_CHECKOUT_PREFIX_STEP_DEFINITIONS, 7, 70, SIGNUP_METHOD_EMAIL, { ...teamOpts, plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION });
        }
        if (pas === PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION) {
          return createHostedCheckoutSteps(PLUS_PAYPAL_HOSTED_CHECKOUT_PREFIX_STEP_DEFINITIONS, 7, 70, SIGNUP_METHOD_EMAIL, { ...teamOpts, plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION });
        }
        return createHostedCheckoutSteps(PLUS_PAYPAL_HOSTED_CHECKOUT_PREFIX_STEP_DEFINITIONS, 7, 70, SIGNUP_METHOD_EMAIL, teamOpts);
      }
      if (signupMethod === SIGNUP_METHOD_PHONE) {
        return reloginAfterBindEmail
          ? createOpenAiSteps(PLUS_PAYPAL_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_PHONE, { ...teamOpts, phoneSignupReloginAfterBindEmailEnabled: true })
          : createOpenAiSteps(PLUS_PAYPAL_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_PHONE, teamOpts);
      }
      if (pas === PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION) {
        return createOpenAiSteps(PLUS_PAYPAL_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_EMAIL, { ...teamOpts, plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION });
      }
      if (pas === PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION) {
        return createOpenAiSteps(PLUS_PAYPAL_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_EMAIL, { ...teamOpts, plusAccountAccessStrategy: PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION });
      }
      return createOpenAiSteps(PLUS_PAYPAL_PREFIX_STEP_DEFINITIONS, 10, 100, SIGNUP_METHOD_EMAIL, teamOpts);
    }

    if (panelMode === LOCAL_CPA_JSON_NO_RT_PANEL_MODE) {
      return [
        ...PLUS_PAYPAL_HOSTED_CHECKOUT_PREFIX_STEP_DEFINITIONS,
        LOCAL_CPA_JSON_NO_RT_EXPORT_STEP_DEFINITION,
      ];
    }
    if (!isPlusModeEnabled(options)) {
      if (signupMethod === SIGNUP_METHOD_PHONE) {
        return reloginAfterBindEmail
          ? NORMAL_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS
          : NORMAL_PHONE_STEP_DEFINITIONS;
      }
      return NORMAL_STEP_DEFINITIONS;
    }
    const paymentMethod = normalizePlusPaymentMethod(options?.plusPaymentMethod || options?.paymentMethod);
    const plusAccountAccessStrategy = normalizePlusAccountAccessStrategy(options?.plusAccountAccessStrategy);
    if (paymentMethod === PLUS_PAYMENT_METHOD_GPC_HELPER) {
      if (signupMethod === SIGNUP_METHOD_PHONE) {
        return reloginAfterBindEmail
          ? PLUS_GPC_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS
          : PLUS_GPC_PHONE_STEP_DEFINITIONS;
      }
      if (plusAccountAccessStrategy === PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION) {
        return PLUS_GPC_SUB2API_SESSION_STEP_DEFINITIONS;
      }
      if (plusAccountAccessStrategy === PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION) {
        return PLUS_GPC_CPA_SESSION_STEP_DEFINITIONS;
      }
      return PLUS_GPC_STEP_DEFINITIONS;
    }
    if (paymentMethod === PLUS_PAYMENT_METHOD_GOPAY) {
      if (signupMethod === SIGNUP_METHOD_PHONE) {
        return reloginAfterBindEmail
          ? PLUS_GOPAY_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS
          : PLUS_GOPAY_PHONE_STEP_DEFINITIONS;
      }
      if (plusAccountAccessStrategy === PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION) {
        return PLUS_GOPAY_SUB2API_SESSION_STEP_DEFINITIONS;
      }
      if (plusAccountAccessStrategy === PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION) {
        return PLUS_GOPAY_CPA_SESSION_STEP_DEFINITIONS;
      }
      return PLUS_GOPAY_STEP_DEFINITIONS;
    }
    if (shouldTreatHostedCheckoutAsFinalStep({
      ...options,
      plusModeEnabled: true,
      plusPaymentMethod: paymentMethod,
    })) {
      if (signupMethod === SIGNUP_METHOD_PHONE) {
        return reloginAfterBindEmail
          ? PLUS_PAYPAL_HOSTED_CHECKOUT_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS
          : PLUS_PAYPAL_HOSTED_CHECKOUT_PHONE_STEP_DEFINITIONS;
      }
      if (plusAccountAccessStrategy === PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION) {
        return PLUS_PAYPAL_HOSTED_CHECKOUT_SUB2API_SESSION_STEP_DEFINITIONS;
      }
      if (plusAccountAccessStrategy === PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION) {
        return PLUS_PAYPAL_HOSTED_CHECKOUT_CPA_SESSION_STEP_DEFINITIONS;
      }
      return PLUS_PAYPAL_HOSTED_CHECKOUT_STEP_DEFINITIONS;
    }
    if (signupMethod === SIGNUP_METHOD_PHONE) {
      return reloginAfterBindEmail
        ? PLUS_PAYPAL_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS
        : PLUS_PAYPAL_PHONE_STEP_DEFINITIONS;
    }
    if (plusAccountAccessStrategy === PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION) {
      return PLUS_PAYPAL_SUB2API_SESSION_STEP_DEFINITIONS;
    }
    if (plusAccountAccessStrategy === PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION) {
      return PLUS_PAYPAL_CPA_SESSION_STEP_DEFINITIONS;
    }
    return PLUS_PAYPAL_STEP_DEFINITIONS;
  }

  function getOpenAiPlusPaymentStepTitle(options = {}) {
    if (!isPlusModeEnabled(options)) {
      return '';
    }
    const paymentStep = getOpenAiModeStepDefinitions({
      ...options,
      plusModeEnabled: true,
    }).find((step) => step.key === PLUS_PAYMENT_STEP_KEY);
    return paymentStep?.title || '';
  }

  function getOpenAiResolvedStepTitle(step = {}, options = {}) {
    if (isPlusModeEnabled(options) && step.key === PLUS_PAYMENT_STEP_KEY) {
      return getOpenAiPlusPaymentStepTitle(options) || step.title;
    }
    const signupMethod = getResolvedSignupMethod(options);
    if (signupMethod === SIGNUP_METHOD_PHONE && PHONE_SIGNUP_TITLE_OVERRIDES[step.key]) {
      return PHONE_SIGNUP_TITLE_OVERRIDES[step.key];
    }
    return step.title;
  }

  const FLOW_DEFINITION_BUILDERS = Object.freeze({
    openai: {
      getAllSteps() {
        const keyed = new Map();
        for (const step of [
          ...NORMAL_STEP_DEFINITIONS,
          ...NORMAL_PHONE_STEP_DEFINITIONS,
          ...NORMAL_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS,
          ...PLUS_PAYPAL_HOSTED_CHECKOUT_STEP_DEFINITIONS,
          ...PLUS_PAYPAL_HOSTED_CHECKOUT_SUB2API_SESSION_STEP_DEFINITIONS,
          ...PLUS_PAYPAL_HOSTED_CHECKOUT_CPA_SESSION_STEP_DEFINITIONS,
          ...PLUS_PAYPAL_HOSTED_CHECKOUT_PREFIX_STEP_DEFINITIONS,
          LOCAL_CPA_JSON_NO_RT_EXPORT_STEP_DEFINITION,
          ...PLUS_PAYPAL_HOSTED_CHECKOUT_PHONE_STEP_DEFINITIONS,
          ...PLUS_PAYPAL_HOSTED_CHECKOUT_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS,
          ...PLUS_PAYPAL_STEP_DEFINITIONS,
          ...PLUS_PAYPAL_SUB2API_SESSION_STEP_DEFINITIONS,
          ...PLUS_PAYPAL_CPA_SESSION_STEP_DEFINITIONS,
          ...PLUS_PAYPAL_PHONE_STEP_DEFINITIONS,
          ...PLUS_PAYPAL_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS,
          ...PLUS_GOPAY_STEP_DEFINITIONS,
          ...PLUS_GOPAY_SUB2API_SESSION_STEP_DEFINITIONS,
          ...PLUS_GOPAY_CPA_SESSION_STEP_DEFINITIONS,
          ...PLUS_GOPAY_PHONE_STEP_DEFINITIONS,
          ...PLUS_GOPAY_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS,
          ...PLUS_GPC_STEP_DEFINITIONS,
          ...PLUS_GPC_SUB2API_SESSION_STEP_DEFINITIONS,
          ...PLUS_GPC_CPA_SESSION_STEP_DEFINITIONS,
          ...PLUS_GPC_PHONE_STEP_DEFINITIONS,
          ...PLUS_GPC_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS,
        ]) {
          keyed.set(`${step.id}:${step.key}`, step);
        }
        return Array.from(keyed.values()).sort((left, right) => {
          const leftOrder = Number.isFinite(left.order) ? left.order : left.id;
          const rightOrder = Number.isFinite(right.order) ? right.order : right.id;
          if (leftOrder !== rightOrder) return leftOrder - rightOrder;
          return left.id - right.id;
        });
      },
      getModeStepDefinitions: getOpenAiModeStepDefinitions,
      getPlusPaymentStepTitle: getOpenAiPlusPaymentStepTitle,
      resolveStepTitle: getOpenAiResolvedStepTitle,
    },
  });

  function hasFlow(flowId) {
    const normalizedFlowId = normalizeActiveFlowId(flowId, '');
    return Boolean(normalizedFlowId && FLOW_DEFINITION_BUILDERS[normalizedFlowId]);
  }

  function getRegisteredFlowIds() {
    return Object.keys(FLOW_DEFINITION_BUILDERS);
  }

  function getFlowDefinitionBuilder(options = {}) {
    const flowId = normalizeActiveFlowId(options?.activeFlowId, DEFAULT_ACTIVE_FLOW_ID);
    return {
      flowId,
      builder: FLOW_DEFINITION_BUILDERS[flowId] || null,
    };
  }

  function cloneSteps(steps = [], options = {}, flowId = DEFAULT_ACTIVE_FLOW_ID) {
    const { builder } = getFlowDefinitionBuilder({ activeFlowId: flowId });
    return steps.map((step) => ({
      ...step,
      flowId,
      title: builder?.resolveStepTitle ? builder.resolveStepTitle(step, options) : step.title,
    }));
  }

  function cloneNodes(steps = [], options = {}, flowId = DEFAULT_ACTIVE_FLOW_ID) {
    const { builder } = getFlowDefinitionBuilder({ activeFlowId: flowId });
    return steps.map((step) => ({
      legacyStepId: Number(step.id),
      nodeId: String(step.key || '').trim(),
      flowId,
      title: builder?.resolveStepTitle ? builder.resolveStepTitle(step, options) : step.title,
      displayOrder: Number.isFinite(Number(step.order)) ? Number(step.order) : Number(step.id),
      nodeType: 'task',
      sourceId: step.sourceId || '',
      driverId: step.driverId || '',
      executeKey: String(step.key || '').trim(),
      command: String(step.command || step.key || '').trim(),
      mailRuleId: String(step.mailRuleId || '').trim(),
      next: Array.isArray(step.next) ? [...step.next] : [],
      retryPolicy: step.retryPolicy && typeof step.retryPolicy === 'object' ? { ...step.retryPolicy } : {},
      recoveryPolicy: step.recoveryPolicy && typeof step.recoveryPolicy === 'object' ? { ...step.recoveryPolicy } : {},
      ui: step.ui && typeof step.ui === 'object' ? { ...step.ui } : {},
    })).filter((node) => Boolean(node.nodeId));
  }

  function getSteps(options = {}) {
    const { flowId, builder } = getFlowDefinitionBuilder(options);
    if (!builder?.getModeStepDefinitions) {
      return [];
    }
    return cloneSteps(builder.getModeStepDefinitions(options), options, flowId);
  }

  function linkLinearNodes(nodes = []) {
    return nodes.map((node, index) => ({
      ...node,
      next: Array.isArray(node.next) && node.next.length
        ? [...node.next]
        : (nodes[index + 1]?.nodeId ? [nodes[index + 1].nodeId] : []),
    }));
  }

  function getNodes(options = {}) {
    const { flowId, builder } = getFlowDefinitionBuilder(options);
    if (!builder?.getModeStepDefinitions) {
      return [];
    }
    return linkLinearNodes(cloneNodes(builder.getModeStepDefinitions(options), options, flowId));
  }

  function getAllSteps(options = {}) {
    const { flowId, builder } = getFlowDefinitionBuilder(options);
    if (!builder?.getAllSteps) {
      return [];
    }
    return cloneSteps(builder.getAllSteps(options), options, flowId);
  }

  function getAllNodes(options = {}) {
    const { flowId, builder } = getFlowDefinitionBuilder(options);
    if (!builder?.getAllSteps) {
      return [];
    }
    return cloneNodes(builder.getAllSteps(options), options, flowId)
      .sort((left, right) => {
        if (left.displayOrder !== right.displayOrder) return left.displayOrder - right.displayOrder;
        return left.nodeId.localeCompare(right.nodeId);
      });
  }

  function getPlusPaymentStepTitle(options = {}) {
    const { builder } = getFlowDefinitionBuilder(options);
    if (!builder?.getPlusPaymentStepTitle) {
      return '';
    }
    return builder.getPlusPaymentStepTitle(options);
  }

  function getStepIds(options = {}) {
    return getSteps(options)
      .map((step) => Number(step.id))
      .filter(Number.isFinite)
      .sort((left, right) => left - right);
  }

  function getNodeIds(options = {}) {
    return getNodes(options).map((node) => node.nodeId);
  }

  function getLastStepId(options = {}) {
    const ids = getStepIds(options);
    return ids[ids.length - 1] || 0;
  }

  function getStepById(id, options = {}) {
    const numericId = Number(id);
    const { flowId, builder } = getFlowDefinitionBuilder(options);
    if (!builder?.getModeStepDefinitions) {
      return null;
    }
    const match = builder.getModeStepDefinitions(options).find((step) => step.id === numericId);
    return match ? cloneSteps([match], options, flowId)[0] : null;
  }

  function getNodeById(nodeId, options = {}) {
    const normalizedNodeId = String(nodeId || '').trim();
    if (!normalizedNodeId) {
      return null;
    }
    return getNodes(options).find((node) => node.nodeId === normalizedNodeId) || null;
  }

  function getNodeByDisplayOrder(displayOrder, options = {}) {
    const normalizedOrder = Number(displayOrder);
    if (!Number.isFinite(normalizedOrder)) {
      return null;
    }
    return getNodes(options).find((node) => node.displayOrder === normalizedOrder) || null;
  }

  function getWorkflow(options = {}) {
    const flowId = normalizeActiveFlowId(options?.activeFlowId, DEFAULT_ACTIVE_FLOW_ID);
    const nodes = getNodes(options);
    return {
      flowId,
      workflowVersion: 1,
      nodes,
      nodeIds: nodes.map((node) => node.nodeId),
    };
  }

  return {
    DEFAULT_ACTIVE_FLOW_ID,
    STEP_DEFINITIONS: NORMAL_STEP_DEFINITIONS,
    NORMAL_STEP_DEFINITIONS,
    NORMAL_PHONE_STEP_DEFINITIONS,
    NORMAL_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS,
    PLUS_STEP_DEFINITIONS: PLUS_PAYPAL_STEP_DEFINITIONS,
    PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH,
    PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION,
    PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION,
    PLUS_PAYPAL_STEP_DEFINITIONS,
    PLUS_PAYPAL_SUB2API_SESSION_STEP_DEFINITIONS,
    PLUS_PAYPAL_CPA_SESSION_STEP_DEFINITIONS,
    PLUS_PAYPAL_PHONE_STEP_DEFINITIONS,
    PLUS_PAYPAL_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS,
    PLUS_PAYPAL_HOSTED_CHECKOUT_SUB2API_SESSION_STEP_DEFINITIONS,
    PLUS_PAYPAL_HOSTED_CHECKOUT_CPA_SESSION_STEP_DEFINITIONS,
    PLUS_GOPAY_STEP_DEFINITIONS,
    PLUS_GOPAY_SUB2API_SESSION_STEP_DEFINITIONS,
    PLUS_GOPAY_CPA_SESSION_STEP_DEFINITIONS,
    PLUS_GOPAY_PHONE_STEP_DEFINITIONS,
    PLUS_GOPAY_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS,
    PLUS_GPC_STEP_DEFINITIONS,
    PLUS_GPC_SUB2API_SESSION_STEP_DEFINITIONS,
    PLUS_GPC_CPA_SESSION_STEP_DEFINITIONS,
    PLUS_GPC_PHONE_STEP_DEFINITIONS,
    PLUS_GPC_PHONE_BOUND_EMAIL_RELOGIN_STEP_DEFINITIONS,
    SIGNUP_METHOD_EMAIL,
    SIGNUP_METHOD_PHONE,
    getAllSteps,
    getAllNodes,
    getLastStepId,
    getNodeByDisplayOrder,
    getNodeById,
    getNodeIds,
    getNodes,
    getPlusPaymentStepTitle,
    getRegisteredFlowIds,
    getStepById,
    getStepIds,
    getSteps,
    getWorkflow,
    hasFlow,
    isPlusModeEnabled,
    normalizePlusAccountAccessStrategy,
    normalizeActiveFlowId,
    normalizePlusPaymentMethod,
    normalizeSignupMethod,
  };
});
