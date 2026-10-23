// Consent Mode: GTM custom template tests.
//
// Each block below is one test for the template editor's Tests tab. Add a
// test, name it exactly as the banner line (number included), and paste the
// code between that banner and the next one. The "Setup" block goes into the
// shared setup field of the Tests tab and runs before every test.
//
// The consent APIs, createQueue and createArgumentsQueue are asserted or
// mocked so nothing touches the window. copyFromDataLayer, queryPermission and
// isConsentGranted are mocked only in the tests that exercise deduplication on
// the Consent Initialization trigger; update tests mock copyFromDataLayer with
// a CMP event so the command is sent in full.

// ============================================================================
// Setup
// ============================================================================
let mockData = {
  command: 'default',
  // Default Consent
  analytics_storage:       'denied',
  ad_storage:              'denied',
  ad_user_data:            'denied',
  ad_personalization:      'denied',
  personalization_storage:  undefined,
  functionality_storage:    undefined,
  security_storage:         undefined,
  // Default Consent (From Variable)
  getStateFromVar: false,
  consentStateVar: {
    analytics_storage:       'denied',
    ad_storage:              'granted',
    ad_user_data:            'granted',
    ad_personalization:      'granted',
    personalization_storage:  undefined,
    functionality_storage:    undefined,
    security_storage:         undefined,
  },
  // Additional Settings
  waitForUpdate:       false,
  wait_for_update:     500,
  url_passthrough:     true,
  ads_data_redaction:  true,
  dataLayerEvent:      false,
  logToConsole:        false,
  // Consent Integrations
  extMsClarity:     false,
  extMsInvest:      false,
  extMsAdvertising: false,
};
const regionsEEA = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'NO', 'IS', 'LI'
];

// ============================================================================
// 1 - Consent State - Default
// ============================================================================
mockData.waitForUpdate = true;
runCode(mockData);

assertApi('setDefaultConsentState').wasCalledWith({
  analytics_storage:  'denied',
  ad_storage:         'denied',
  ad_user_data:       'denied',
  ad_personalization: 'denied',
  wait_for_update:     500,
});
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 2 - Consent State - Default (From Variable)
// ============================================================================
mockData.getStateFromVar = true;
mockData.waitForUpdate = true;
runCode(mockData);

assertApi('setDefaultConsentState').wasCalledWith({
  analytics_storage:  'denied',
  ad_storage:         'granted',
  ad_user_data:       'granted',
  ad_personalization: 'granted',
  wait_for_update:     500,
});
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 3 - Consent State - Default - Regional - EEA
// ============================================================================
mockData.includeEEA = true;
mockData.waitForUpdate = true;
runCode(mockData);

assertApi('setDefaultConsentState').wasCalledWith({
  analytics_storage:  'denied',
  ad_storage:         'denied',
  ad_user_data:       'denied',
  ad_personalization: 'denied',
  wait_for_update:     500,
  region:              regionsEEA,
});
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 4 - Consent State - Default - Regional - EEA (From Variable)
// ============================================================================
mockData.includeEEA = true;
mockData.getStateFromVar = true;
mockData.waitForUpdate = true;
runCode(mockData);

assertApi('setDefaultConsentState').wasCalledWith({
  analytics_storage:  'denied',
  ad_storage:         'granted',
  ad_user_data:       'granted',
  ad_personalization: 'granted',
  wait_for_update:     500,
  region:              regionsEEA,
});
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 5 - Consent State - Default - Regional - Custom
// ============================================================================
mockData.includeEEA = false;
mockData.waitForUpdate = true;

// Single region
mockData.regions = 'US';
runCode(mockData);
assertApi('setDefaultConsentState').wasCalledWith({
  analytics_storage:  'denied',
  ad_storage:         'denied',
  ad_user_data:       'denied',
  ad_personalization: 'denied',
  wait_for_update:     500,
  region:              ['US'],
});
assertApi('gtmOnSuccess').wasCalled();

// Several regions, with spaces and lower case to trim and normalise
mockData.regions = 'us, CA ,SE';
runCode(mockData);
assertApi('setDefaultConsentState').wasCalledWith({
  analytics_storage:  'denied',
  ad_storage:         'denied',
  ad_user_data:       'denied',
  ad_personalization: 'denied',
  wait_for_update:     500,
  region:              ['US', 'CA', 'SE'],
});
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 6 - Consent State - Default - Regional - Custom (From Variable)
// ============================================================================
mockData.includeEEA = false;
mockData.waitForUpdate = true;
mockData.getStateFromVar = true;

// Single region
mockData.regions = 'US';
runCode(mockData);
assertApi('setDefaultConsentState').wasCalledWith({
  analytics_storage:  'denied',
  ad_storage:         'granted',
  ad_user_data:       'granted',
  ad_personalization: 'granted',
  wait_for_update:     500,
  region:              ['US'],
});
assertApi('gtmOnSuccess').wasCalled();

// Several regions
mockData.regions = 'US,CA';
runCode(mockData);
assertApi('setDefaultConsentState').wasCalledWith({
  analytics_storage:  'denied',
  ad_storage:         'granted',
  ad_user_data:       'granted',
  ad_personalization: 'granted',
  wait_for_update:     500,
  region:              ['US', 'CA'],
});
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 7 - Consent State - Default - Regional - Custom - Including EEA
// ============================================================================
mockData.includeEEA = true;
mockData.waitForUpdate = true;
// SE is also in the EEA list and must appear once.
mockData.regions = 'US,CA,SE';
runCode(mockData);

assertApi('setDefaultConsentState').wasCalledWith({
  analytics_storage:  'denied',
  ad_storage:         'denied',
  ad_user_data:       'denied',
  ad_personalization: 'denied',
  wait_for_update:     500,
  region:              ['US', 'CA', 'SE'].concat(regionsEEA.filter(r => r !== 'SE')),
});
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 8 - Consent State - Default - Regional - Custom - Including EEA (From Variable)
// ============================================================================
mockData.includeEEA = true;
mockData.waitForUpdate = true;
mockData.getStateFromVar = true;
mockData.regions = 'US,CA';
runCode(mockData);

assertApi('setDefaultConsentState').wasCalledWith({
  analytics_storage:  'denied',
  ad_storage:         'granted',
  ad_user_data:       'granted',
  ad_personalization: 'granted',
  wait_for_update:     500,
  region:              ['US', 'CA'].concat(regionsEEA),
});
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 9 - Consent State - Update
// ============================================================================
mock('copyFromDataLayer', key => 'cmp_consent_update');
mockData.command = 'update';
mockData.analytics_storage = 'granted';
mockData.ad_storage = 'true';
mockData.ad_user_data = true;
mockData.ad_personalization = 'denied';
mockData.personalization_storage = 'false';
mockData.functionality_storage = false;
mockData.security_storage = 'INVALID';
runCode(mockData);

// Every accepted spelling is normalised; an unknown value is left out.
assertApi('updateConsentState').wasCalledWith({
  analytics_storage:       'granted',
  ad_storage:              'granted',
  ad_user_data:            'granted',
  ad_personalization:      'denied',
  personalization_storage: 'denied',
  functionality_storage:   'denied',
});
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 10 - Consent State - Update (From Variable)
// ============================================================================
mock('copyFromDataLayer', key => 'cmp_consent_update');
mockData.command = 'update';
mockData.getStateFromVar = true;
mockData.consentStateVar = {
  analytics_storage:  1,
  ad_storage:         0,
  ad_user_data:       'granted',
  ad_personalization: 'false',
  security_storage:   'maybe',
};
runCode(mockData);

assertApi('updateConsentState').wasCalledWith({
  analytics_storage:  'granted',
  ad_storage:         'denied',
  ad_user_data:       'granted',
  ad_personalization: 'denied',
});
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 11 - Additional Settings - Wait For Update
// ============================================================================
const baseState = {
  analytics_storage:  'denied',
  ad_storage:         'denied',
  ad_user_data:       'denied',
  ad_personalization: 'denied',
};

// Unchecked: omitted even when the hidden field still holds a value
mockData.waitForUpdate = false;
mockData.wait_for_update = 500;
runCode(mockData);
assertApi('setDefaultConsentState').wasCalledWith(baseState);
assertApi('gtmOnSuccess').wasCalled();

// Checked with 0: omitted
mockData.waitForUpdate = true;
mockData.wait_for_update = 0;
runCode(mockData);
assertApi('setDefaultConsentState').wasCalledWith(baseState);

// Checked with a decimal: rounded to a whole millisecond
mockData.wait_for_update = 1.4;
runCode(mockData);
assertApi('setDefaultConsentState').wasCalledWith({
  analytics_storage:  'denied',
  ad_storage:         'denied',
  ad_user_data:       'denied',
  ad_personalization: 'denied',
  wait_for_update:     1,
});

// Checked with a numeric string from a variable
mockData.wait_for_update = '0100';
runCode(mockData);
assertApi('setDefaultConsentState').wasCalledWith({
  analytics_storage:  'denied',
  ad_storage:         'denied',
  ad_user_data:       'denied',
  ad_personalization: 'denied',
  wait_for_update:     100,
});
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 12 - Additional Settings - URL Passthrough & Ads Data Redaction
// ============================================================================
// Both flags are written on every fire, as true or false.
mockData.url_passthrough = true;
mockData.ads_data_redaction = true;
runCode(mockData);
assertApi('gtagSet').wasCalledWith({ url_passthrough: true, ads_data_redaction: true });

mockData.url_passthrough = true;
mockData.ads_data_redaction = false;
runCode(mockData);
assertApi('gtagSet').wasCalledWith({ url_passthrough: true, ads_data_redaction: false });

mockData.url_passthrough = false;
mockData.ads_data_redaction = true;
runCode(mockData);
assertApi('gtagSet').wasCalledWith({ url_passthrough: false, ads_data_redaction: true });

// Unchecked boxes arrive as undefined and are written as false.
mockData.url_passthrough = undefined;
mockData.ads_data_redaction = undefined;
runCode(mockData);
assertApi('gtagSet').wasCalledWith({ url_passthrough: false, ads_data_redaction: false });
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 13 - Data Layer Event
// ============================================================================
mock('copyFromDataLayer', key => 'cmp_consent_update');
let pushed;
mock('createQueue', arrayKey => {
  if (arrayKey === 'dataLayer') return event => { pushed = event; };
  return () => {};
});

// Default command: predefined name, no previous state
mockData.dataLayerEvent = true;
mockData.waitForUpdate = true;
runCode(mockData);
assertApi('gtmOnSuccess').wasCalled();
assertThat(pushed.event).isEqualTo('consent_default');
assertThat(pushed.consent_state).isEqualTo({
  analytics_storage:  'denied',
  ad_storage:         'denied',
  ad_user_data:       'denied',
  ad_personalization: 'denied',
});
assertThat(pushed.consent_state_previous).isUndefined();

// Update command on the same page: the previous state is what the default set,
// and consent_state merges the partial update over it.
pushed = undefined;
mockData.command = 'update';
mockData.waitForUpdate = false;
mockData.includePreviousState = true;
mockData.analytics_storage = 'granted';
mockData.ad_storage = 'granted';
mockData.ad_user_data = undefined;
mockData.ad_personalization = undefined;
runCode(mockData);
assertApi('gtmOnSuccess').wasCalled();
assertThat(pushed.event).isEqualTo('consent_update');
assertThat(pushed.consent_state).isEqualTo({
  analytics_storage:  'granted',
  ad_storage:         'granted',
  ad_user_data:       'denied',
  ad_personalization: 'denied',
});
assertThat(pushed.consent_state_previous).isEqualTo({
  analytics_storage:  'denied',
  ad_storage:         'denied',
  ad_user_data:       'denied',
  ad_personalization: 'denied',
});

// Custom event name
pushed = undefined;
mockData.useCustomEventName = true;
mockData.customEventName = 'cookie_consent';
runCode(mockData);
assertThat(pushed.event).isEqualTo('cookie_consent');

// Unchecked: nothing is pushed
pushed = undefined;
mockData.dataLayerEvent = false;
runCode(mockData);
assertThat(pushed).isUndefined();

// ============================================================================
// 14 - Integration - Microsoft Clarity
// ============================================================================
mock('copyFromDataLayer', key => 'cmp_consent_update');
let clarityCall;
mock('createArgumentsQueue', (fnKey, arrayKey) => (command, payload) => {
  clarityCall = { fnKey: fnKey, arrayKey: arrayKey, command: command, payload: payload };
});
mockData.extMsClarity = true;

// Both denied: Clarity is told so, instead of being left without a signal
runCode(mockData);
assertThat(clarityCall).isEqualTo({
  fnKey:    'clarity',
  arrayKey: 'clarity.q',
  command:  'consentv2',
  payload:  { ad_Storage: 'denied', analytics_Storage: 'denied' },
});
assertApi('gtmOnSuccess').wasCalled();

// Analytics granted, ads denied
mockData.analytics_storage = 'granted';
runCode(mockData);
assertThat(clarityCall.payload).isEqualTo({ ad_Storage: 'denied', analytics_Storage: 'granted' });

// Update with both granted
mockData.command = 'update';
mockData.ad_storage = 'granted';
runCode(mockData);
assertThat(clarityCall.command).isEqualTo('consentv2');
assertThat(clarityCall.payload).isEqualTo({ ad_Storage: 'granted', analytics_Storage: 'granted' });
assertApi('gtmOnSuccess').wasCalled();

// Disabled: nothing is sent
clarityCall = undefined;
mockData.extMsClarity = false;
runCode(mockData);
assertThat(clarityCall).isUndefined();

// ============================================================================
// 15 - Integration - Microsoft Advertising (UET)
// ============================================================================
mock('copyFromDataLayer', key => 'cmp_consent_update');
let uetCall;
mock('createQueue', arrayKey => {
  if (arrayKey === 'uetq') return (action, command, consent) => {
    uetCall = { action: action, command: command, consent: consent };
  };
  return () => {};
});
mockData.extMsAdvertising = true;

// Default denied
runCode(mockData);
assertThat(uetCall).isEqualTo({ action: 'consent', command: 'default', consent: { ad_storage: 'denied' } });
assertApi('gtmOnSuccess').wasCalled();

// Update granted
mockData.command = 'update';
mockData.ad_storage = 'granted';
runCode(mockData);
assertThat(uetCall).isEqualTo({ action: 'consent', command: 'update', consent: { ad_storage: 'granted' } });

// ad_storage missing from a variable: denied is sent
mockData.getStateFromVar = true;
mockData.consentStateVar = { analytics_storage: 'granted' };
runCode(mockData);
assertThat(uetCall.consent).isEqualTo({ ad_storage: 'denied' });
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 16 - Integration - Microsoft Invest
// ============================================================================
mock('copyFromDataLayer', key => 'cmp_consent_update');
let investCall;
mock('createQueue', arrayKey => {
  if (arrayKey === 'actionQueue') return action => { investCall = action; };
  return () => {};
});
mockData.extMsInvest = true;

// Default denied with wait_for_update
mockData.waitForUpdate = true;
runCode(mockData);
assertThat(investCall).isEqualTo({
  action:      'consent',
  actionValue: 'default',
  params:      { ad_storage: 'denied', wait_for_update: 500 },
});
assertApi('gtmOnSuccess').wasCalled();

// Update granted, no wait_for_update
mockData.command = 'update';
mockData.ad_storage = 'granted';
mockData.waitForUpdate = false;
runCode(mockData);
assertThat(investCall).isEqualTo({
  action:      'consent',
  actionValue: 'update',
  params:      { ad_storage: 'granted' },
});
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 17 - Deduplication - Default is sent in full on Consent Initialization
// ============================================================================
// Nothing has been set yet, so Tag Manager reports every type as granted. A
// granted default must still be sent, and the integrations must see it.
mock('copyFromDataLayer', key => 'gtm.init_consent');
mock('queryPermission', (permission, consentType, access) => true);
mock('isConsentGranted', consentType => true);
let uetCall;
mock('createQueue', arrayKey => {
  if (arrayKey === 'uetq') return (action, command, consent) => { uetCall = consent; };
  return () => {};
});
mockData.extMsAdvertising = true;
mockData.waitForUpdate = true;
mockData.analytics_storage = 'granted';
mockData.ad_storage = 'granted';
mockData.ad_user_data = 'granted';
mockData.ad_personalization = 'granted';
runCode(mockData);

assertApi('setDefaultConsentState').wasCalledWith({
  analytics_storage:  'granted',
  ad_storage:         'granted',
  ad_user_data:       'granted',
  ad_personalization: 'granted',
  wait_for_update:     500,
});
assertThat(uetCall).isEqualTo({ ad_storage: 'granted' });
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 18 - Deduplication - Update drops unchanged types on Consent Initialization
// ============================================================================
// The default tag has set everything to denied earlier on the page. Only the
// types that change reach Google; the event and UET get the full state.
mock('copyFromDataLayer', key => 'gtm.init_consent');
mock('queryPermission', (permission, consentType, access) => true);
mock('isConsentGranted', consentType => false);
let pushed, uetCall;
mock('createQueue', arrayKey => {
  if (arrayKey === 'dataLayer') return event => { pushed = event; };
  if (arrayKey === 'uetq') return (action, command, consent) => { uetCall = consent; };
  return () => {};
});
mockData.command = 'update';
mockData.dataLayerEvent = true;
mockData.extMsAdvertising = true;
mockData.analytics_storage = 'granted';
mockData.ad_storage = 'denied';
mockData.ad_user_data = 'granted';
mockData.ad_personalization = 'denied';
runCode(mockData);

assertApi('updateConsentState').wasCalledWith({
  analytics_storage: 'granted',
  ad_user_data:      'granted',
});
assertThat(pushed.consent_state).isEqualTo({
  analytics_storage:  'granted',
  ad_storage:         'denied',
  ad_user_data:       'granted',
  ad_personalization: 'denied',
});
assertThat(uetCall).isEqualTo({ ad_storage: 'denied' });
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 19 - Deduplication - Update is skipped when nothing changed
// ============================================================================
mock('copyFromDataLayer', key => 'gtm.init_consent');
mock('queryPermission', (permission, consentType, access) => true);
mock('isConsentGranted', consentType => false);
let queueUsed = false;
mock('createQueue', arrayKey => () => { queueUsed = true; });
mockData.command = 'update';
mockData.dataLayerEvent = true;
mockData.extMsAdvertising = true;
runCode(mockData);

assertApi('updateConsentState').wasNotCalled();
assertThat(queueUsed, 'integrations or data layer event ran for a skipped command').isFalse();
// The flags are written regardless and the tag still succeeds.
assertApi('gtagSet').wasCalled();
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 20 - Deduplication - Update is not deduplicated on other triggers
// ============================================================================
// On a CMP event the visitor has just made a choice, so the command goes out
// in full even when Tag Manager already holds the same values.
mock('copyFromDataLayer', key => 'cmp_consent_update');
mock('queryPermission', (permission, consentType, access) => true);
mock('isConsentGranted', consentType => false);
mockData.command = 'update';
runCode(mockData);

assertApi('updateConsentState').wasCalledWith({
  analytics_storage:  'denied',
  ad_storage:         'denied',
  ad_user_data:       'denied',
  ad_personalization: 'denied',
});
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 21 - Integration - Microsoft Clarity is skipped when a value is missing
// ============================================================================
mock('copyFromDataLayer', key => 'cmp_consent_update');
let clarityCalled = false;
mock('createArgumentsQueue', (fnKey, arrayKey) => () => { clarityCalled = true; });
const logs = [];
mock('logToConsole', message => { logs.push(message); });
mockData.extMsClarity = true;
mockData.logToConsole = true;
mockData.getStateFromVar = true;
mockData.consentStateVar = { analytics_storage: 'granted' };
runCode(mockData);

assertThat(clarityCalled, 'consentv2 was called without ad_storage').isFalse();
assertThat(logs.some(m => m.indexOf('Microsoft Clarity') !== -1), 'no log line about the skipped Clarity call').isTrue();
assertApi('gtmOnSuccess').wasCalled();

// ============================================================================
// 22 - Debug Logging - Logs the command as JSON
// ============================================================================
const logs = [];
mock('logToConsole', message => { logs.push(message); });

// Unchecked: silent
runCode(mockData);
assertThat(logs).isEmpty();

// Checked: the command that was sent, readable
mockData.logToConsole = true;
runCode(mockData);
assertThat(logs[0]).isEqualTo('default: {"analytics_storage":"denied","ad_storage":"denied","ad_user_data":"denied","ad_personalization":"denied"}');
assertApi('gtmOnSuccess').wasCalled();
