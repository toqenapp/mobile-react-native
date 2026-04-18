import { authMobileConfirm } from "./auth-mobile/auth-mobile-confirm";
import { authMobileStart } from "./auth-mobile/auth-mobile-start";
import { authConfirm } from "./auth/auth-confirm";
import { authManualCode } from "./auth/auth-manual-code";
import { authScanned } from "./auth/auth-scanned";
import { registerComplete } from "./register/register-complete";
import { registerInit } from "./register/register-init";
import { servicesSync } from "./services/sync";

const api = {
  auth: {
    scanned: authScanned,
    manualCode: authManualCode,
    confirm: authConfirm,
  },
  authMobile: {
    start: authMobileStart,
    confirm: authMobileConfirm,
  },
  services: {
    sync: servicesSync,
  },
  register: {
    init: registerInit,
    complete: registerComplete,
  },
};

export { api };
