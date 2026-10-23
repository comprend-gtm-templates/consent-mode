# Consent Mode

Manages consent mode using the internal Consent APIs and offers the following functionality:
- Update the seven Google consent types:
  - `analytics_storage`
  - `ad_storage`
  - `ad_user_data`
  - `ad_personalization`
  - `personalization_storage`
  - `functionality_storage`
  - `security_storage`
- Set region-specific defaults
- Set `wait_for_update`
- Set `url_passthrough`
- Set `ads_data_redaction`
- Announce every consent change with a data layer event
- Manage consent for third-party integrations:
  - Microsoft Clarity
  - Microsoft Advertising (UET)
  - Microsoft Invest (Universal Pixel)

# Behaviour

- Reads **Consent Command** and builds the consent state from the seven consent type fields, or from the object returned by the variable chosen under **Read Settings From Variable**. For every type, `granted`, `true` (string or boolean) and `1` mean granted; `denied`, `false` (string or boolean) and `0` mean denied. Any other value, including `(not set)` and an unmapped variable, leaves that type out of the command.
- With **Consent Command** set to `default`, adds the region list from **Regions** and **EEA Regions** and the `wait_for_update` value from **Wait For Update**. Neither is available for `update`.
- A `default` command is always sent in full. An `update` command fired on the **Consent Initialization - All Pages** trigger is compared with the consent state Tag Manager already holds, and types whose value would not change are left out of the command sent to Google. If nothing would change, or the state holds no consent type at all, the command, the integrations and the data layer event are all skipped; the two flags below are still written. An `update` on any other trigger is sent in full.
- Sends the command through Tag Manager's own consent interface rather than a `gtag` call, so it is processed before any queued data layer messages, as Google requires of consent templates.
- Writes **URL Passthrough** and **Ads Data Redaction** on every fire, as `true` or `false`. An unchecked box actively sets `false` and overrides a value set earlier by page code or another tag.
- Runs the enabled **Consent Integrations** and pushes the data layer event (when **Data Layer Event** is checked) with the full requested consent state, not the trimmed command, so a type that Google already had still reaches Microsoft and the data layer.
- Always ends successfully; a skipped command is not a failure. **Debug Logging** output appears in the browser console in Preview and debug mode only.

# Fields

## Consent Command

| Field | Option | Description | Example |
| --- | --- | --- | --- |
| Consent Command | `default` | Sets the default consent state and shows **Region Specific Behaviour** and **Wait For Update**. | <img width="289" height="76" alt="image" src="https://github.com/user-attachments/assets/4c8913e5-55c2-4e07-930c-0808f17d0d2e" /> |
| Consent Command | `update` | Sends a consent update and shows **Include Previous State**. | <img width="280" height="73" alt="image" src="https://github.com/user-attachments/assets/a3e72bdf-682c-4503-aa27-1e5550b9a0e7" /> |

## Region Specific Behaviour

Shown for **Consent Command** `default`.

| Field | Required | Accepts | Description | Example |
| --- | --- | --- | --- | --- |
| Regions | No | Comma-separated ISO 3166-2 country or subdivision codes, for example `SE,DK,DE` or `US-CA`, literal or variable. Spaces are trimmed and codes are upper-cased | Becomes the `region` list of the default command, so the defaults apply to visitors from those regions only. Empty, with **EEA Regions** unchecked: the defaults apply to all visitors | <img width="276" height="71" alt="image" src="https://github.com/user-attachments/assets/8b581d6c-2ded-4a5b-b73f-557c25cfe035" /> |
| EEA Regions | No | Checkbox, unchecked by default | Adds the 30 EEA countries (the 27 EU member states plus Norway, Iceland and Liechtenstein) to the `region` list, deduplicated against **Regions** | <img width="154" height="38" alt="image" src="https://github.com/user-attachments/assets/af9eaf62-ee8c-4420-b10b-12a45d9b7e6c" /> |

## Consent Settings

> [!IMPORTANT]
> When using the **Read Settings From variable** option or mapping a variable to a specific consent field:
> | Value     | Consent State |
> | --------- | ------------- |
> | `"granted"` | `"granted"` |
> | 'denied'  | `"denied"`  |
> | `1`       | `"granted"` |
> | `0`       | `"denied"`  |
> | `true`    | `"granted"` |
> | `false`   | `"denied"`  |
> | `undefined`   | `"denied"`  |
> | `null`   | `"denied"`  |

### Read Settings From Variable

| Example |
| ------- |
| <img width="351" height="89" alt="image" src="https://github.com/user-attachments/assets/fdc18e07-736c-4212-9f67-1a8aa37b5528" /> |


Expects a variable, for example a Data Layer Variable or a Custom JavaScript variable, that returns an object such as:

```js
{
  analytics_storage: 'granted',
  ad_storage: 'denied',
  ad_user_data: true,
  ad_personalization: 0
}
```

This sends `analytics_storage` and `ad_user_data` as granted and `ad_storage` and `ad_personalization` as denied. Types missing from the object are left out of the command.

### Consent Types

| Field | Required | Accepts | Description |
| --- | --- | --- | --- |
| ad_storage | No | `granted`, `denied` (default) or a variable | Consent for advertising cookies and identifiers. Cannot be `(not set)` while **Microsoft Clarity**, **Microsoft Advertising** or **Microsoft Invest** is enabled |
| ad_user_data | No | `granted`, `denied` (default) or a variable | Consent for sending user data to Google for advertising purposes |
| ad_personalization | No | `granted`, `denied` (default) or a variable | Consent for personalised advertising (remarketing) |
| personalization_storage | No | `granted`, `denied`, `(not set)` (default) or a variable | Consent for personalisation storage. `(not set)`: left out of the command |
| functionality_storage | No | `granted`, `denied`, `(not set)` (default) or a variable | Consent for storage that supports site functionality, such as language settings. `(not set)`: left out of the command |
| security_storage | No | `granted`, `denied`, `(not set)` (default) or a variable | Consent for security storage such as authentication and fraud prevention. `(not set)`: left out of the command |

## Additional Settings

| Field | Required | Accepts | Description |
| --- | --- | --- | --- |
| Wait For Update | No | Checkbox, unchecked by default. Shown for `default` | Checked: shows **Time to wait (milliseconds)** and adds `wait_for_update` to the default command, so Google tags hold their data for that long while waiting for an update |
| Time to wait (milliseconds) | When **Wait For Update** is checked | Non-negative number, default `500`, literal or variable | Rounded to the nearest whole millisecond. `0` or empty: `wait_for_update` is omitted |
| URL Passthrough | No | Checkbox, unchecked by default | Sets `url_passthrough` to `true` or `false`. When `true` and `ad_storage` or `analytics_storage` is denied, Google tags carry ad click and session information across same-domain pages as URL parameters (`gclid`, `dclid`, `gclsrc`, `_gl`, `wbraid`) |
| Ads Data Redaction | No | Checkbox, unchecked by default | Sets `ads_data_redaction` to `true` or `false`. When `true` and `ad_storage` is denied, Google Ads and Floodlight requests redact ad click identifiers and page URLs that contain them. No effect while `ad_storage` is granted |
| Data Layer Event | No | Checkbox, unchecked by default | Checked: pushes the [data layer event](#data-layer-event) after a successful command and shows the two options that follow |
| Include Previous State | No | Checkbox, unchecked by default. Shown for `update` | Adds `consent_state_previous` to the event: the last state this template set on the current page, or undefined on its first fire |
| Custom Event Name | No | Checkbox, unchecked by default. Shows a text field that must not be empty | Replaces the event name `consent_default` or `consent_update` with your own |
| Debug Logging | No | Checkbox, unchecked by default | Logs the command sent, skipped commands and missing permissions to the console in Preview and debug mode |

## Consent Integrations

Every integration receives the plain consent state for every visitor. The region list is not passed on, so a region-specific default is applied to all visitors by these integrations; the template shows a warning when both are configured.

| Field | Required | Accepts | Description |
| --- | --- | --- | --- |
| Microsoft Clarity | No | Checkbox, unchecked by default | Calls `clarity('consentv2', { ad_Storage, analytics_Storage })` with the values of `ad_storage` and `analytics_storage`, granted or denied alike, so Clarity sets or clears its cookies accordingly; if Clarity has not loaded yet, the call is queued for it. A type that is not part of the state is sent as `denied` |
| Microsoft Advertising | No | Checkbox, unchecked by default | Pushes `'consent', '<command>', { ad_storage }` to the `uetq` queue of Universal Event Tracking. When `ad_storage` is not part of the command, `denied` is sent |
| Microsoft Invest | No | Checkbox, unchecked by default | Pushes a `consent` action with `<command>` and `{ ad_storage, wait_for_update }` to the `actionQueue` of the Universal Pixel (pixie.js). `wait_for_update` is included only when set; `ad_storage` is left empty when it is not part of the command |

## Data layer event

```js
{
  event: 'consent_default',           // or 'consent_update', or your Custom Event Name
  consent_state: {                    // every type this template has set on the current page
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  },
  consent_state_previous: { ... }     // only with Include Previous State, undefined on the first fire
}
```

`consent_state` merges the new command over the state from this template's earlier fires on the same page, so a partial update still reports the full picture. Types that have never been set on the page are absent. `region` and `wait_for_update` are not included.

