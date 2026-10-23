const logToConsole = require('logToConsole');
const Object = require('Object');
const gtagSet = require('gtagSet');
const makeInteger = require('makeInteger');
const queryPermission = require('queryPermission');
const isConsentGranted = require('isConsentGranted');
const setConsent = {
  'default': require('setDefaultConsentState'),
  'update':  require('updateConsentState')
};

const isConsentReadOnEventAllowed = (() => {
  const currentEvent = require('copyFromDataLayer')('event');
  return !!(!currentEvent || currentEvent === 'undefined' || currentEvent === 'gtm.init_consent');
})();

const consentTypes = [
  'analytics_storage',
  'ad_storage',
  'ad_user_data',
  'ad_personalization',
  'personalization_storage',
  'functionality_storage',
  'security_storage'
];

const regionsEEA = [
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  'NO',
  'IS',
  'LI'
];

// Update Consent - Global
const newConsentState = deduplicateConsentStates(getNewConsentState());

if (newConsentState) {
  setConsent[data.command](newConsentState);
  log(data.command + ': ' + newConsentState);
}

// URL Passthrough & Ads Data Redaction
gtagSet({
  'url_passthrough':    data.url_passthrough    || false,
  'ads_data_redaction': data.ads_data_redaction || false
});

if (newConsentState) {
  // Consent Mode Integrations
  activateIntegrations(newConsentState);

  // Push Data Layer Event
  if (data.dataLayerEvent) {
    const event = getEventMessage(newConsentState);
    require('createQueue')('dataLayer')(event);
  }
}

// Done
data.gtmOnSuccess();


/* -------------------------------------------------------------------------- */
/* ---------------------------- HELPER FUNCTIONS ---------------------------- */
/* -------------------------------------------------------------------------- */

function log(message) {
  if (data.logToConsole)
    logToConsole(message);
}

function isQueryPermissionGranted(consentType, permissionType) {
  const isGranted = queryPermission('access_consent', consentType, permissionType);
  if (!isGranted) {
    log('Permission type "' + permissionType + '" is not granted for consent type "' + consentType + '"');
  }
  return isGranted;
}

function readConsentState(consentType) {
  if (!isConsentReadOnEventAllowed)
    return undefined;
  if (!isQueryPermissionGranted(consentType, 'read'))
    return undefined;
  return isConsentGranted(consentType) ? 'granted' : 'denied';
}

function getEventMessage(newState) {
  const tplStorage = require('templateStorage');
  const previousState = tplStorage.getItem('previousConsentState') || undefined;
  const mergedState = {};
  consentTypes.forEach(consentType => {
    if (newState[consentType])
      mergedState[consentType] = newState[consentType];
    else if (previousState)
      mergedState[consentType] = previousState[consentType];
  });
  tplStorage.setItem('previousConsentState', mergedState);

  return {
    'event': data.customEventName || ('consent_' + data.command),
    'consent_state': mergedState || undefined,
    'consent_state_previous': data.includePreviousState ? previousState : undefined,
  };
}

function deduplicateConsentStates(newConsentState) {
  const consentTypes = Object.keys(newConsentState);
  consentTypes.forEach(type => {
    const currentState = readConsentState(type);
    if (!currentState) return;
    const newState = newConsentState[type];
    if (newState === currentState)
      Object.delete(newConsentState, type);
  });
  const stateModified = !!Object.keys(newConsentState).length;
  if (!stateModified) {
    log('No changes in consent state. Skipping "' + data.command + '" command.');
    return false;
  }
  return newConsentState;
}

function getNewConsentState() {
  const consentSource = data.getStateFromVar ? data.consentStateVar : data;
  const newConsentState = {};
  consentTypes.forEach(consentType => {
    const typeState = ({
      'true':    'granted',
      'granted': 'granted',
      'false':   'denied',
      'denied':  'denied',
      '1':       'granted',
      '0':       'denied',
    }[consentSource[consentType]]);
    if (typeState)
      newConsentState[consentType] = typeState;
  });
  const regions = getRegions();
  if (regions)
    newConsentState.region = regions;
  const waitForUpdate = getWaitForUpdate();
  if (waitForUpdate)
    newConsentState.wait_for_update = waitForUpdate;
  return newConsentState;
}

function getRegions() {
  if (data.command !== 'default')
    return false;
  if (!data.includeEEA && !data.regions)
    return false;
  if (data.includeEEA && !data.regions)
    return regionsEEA;
  const regionsInput = data.regions.split(',').map(r => r.trim().toUpperCase());
  if (data.includeEEA)
    return regionsInput.concat(regionsEEA).filter((r, i, self) => r && self.indexOf(r) === i);
  return regionsInput;
}

function getWaitForUpdate() {
  return data.waitForUpdate ? makeInteger(data.wait_for_update) : false;
}

function activateIntegrations(consentState) {
  // Microsoft Clarity
  if (data.extMsClarity) {
    if (consentState.analytics_storage === 'granted') {
      const clarityIsDefined = require('copyFromWindow')('clarity');
      if (clarityIsDefined)
        require('callInWindow')('clarity', 'consent');
      else
        require('createArgumentsQueue')('clarity', 'clarity.q')('consent');
    }
  }
  // Microsoft Advertising
  if (data.extMsAdvertising) {
    require('createQueue')('uetq')('consent', data.command, { 'ad_storage': consentState.ad_storage || 'denied' });
  }
  // Microsoft Invest
  if (data.extMsInvest) {
    const msInvestConsent = { 'ad_storage': consentState.ad_storage };
    const waitForUpdate = getWaitForUpdate();
    if (waitForUpdate) msInvestConsent.wait_for_update = waitForUpdate;
    require('createQueue')('actionQueue')({
      'action':     'consent',
      'actionValue': data.command,
      'params':      msInvestConsent
    });
  }
}
