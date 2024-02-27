# PagerDuty Events Module for Backstage

A backstage module with events support for [PagerDuty webhook](https://support.pagerduty.com/docs/webhooks) events.

## Verifying Webhooks

https://developer.pagerduty.com/docs/28e906a0e4f36-verifying-signatures

const crypto = require('crypto')
module.exports = class PagerDutyVerifier {
constructor(key, version) {
this.key = key
this.version = version
}

    verify(payload, signatures) {
    	var signature = crypto
        	.createHmac('sha256', key)
        	.update(payload)
        	.digest('hex')

    var signatureWithVersion = version + "=" + signature
    var signatureList =  signatures.split(",")

    if (signatureList.indexOf(signatureWithVersion) > -1 ) {
      return true
    	} else {
    	  return false
    	}
    }

}

{
"event": {
"id": "01CH754SM17TWPE2V2H4VPBRO7",
"event_type": "pagey.ping",
"resource_type": "pagey",
"occurred_at": "2021-12-08T22:58:53.510Z",
"agent": null,
"client": null,
"data": {
"message": "Hello from your friend Pagey!",
"type": "ping"
}
}
}

X-PagerDuty-Signature

This package is a module for the `events-backend` backend plugin
and extends the event system with an `PagerDutyEventRouter`.

The event router will subscribe to the topic `pagerduty`
and route the events to more concrete topics based on the value
of the provided `event_type` payload field.

Examples:

| `event_type`            | topic                             |
| ----------------------- | --------------------------------- |
| `incident.acknowledged` | `pagerduty.incident.acknowledged` |
| `service.updated`       | `pagerduty.service.updated`       |

## Installation

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @codingdiaz/plugin-events-backend-module-pagerduty
```

### Event Router

```ts
// packages/backend/src/index.ts
import { eventsModulePagerDutyRouter } from "@backstage/plugin-events-backend-module-pagerduty/alpha";
// ...
backend.add(eventsModulePagerDutyEventRouter());
```

#### Legacy Backend System

```ts
// packages/backend/src/plugins/events.ts
const eventRouter = new PagerDutyEventRouter({ events: env.events });
await eventRouter.subscribe();
```

### Signature Validator

```ts
// packages/backend/src/index.ts
import { eventsModulePagerDutyWebhook } from "@backstage/plugin-events-backend-module-pagerduty/alpha";
// ...
backend.add(eventsModulePagerDutyWebhook());
```

#### Legacy Backend System

Add the signature validator for the topic `PagerDuty`:

```diff
// packages/backend/src/plugins/events.ts
+ import { createPagerDutySignatureValidator } from '@backstage/plugin-events-backend-module-PagerDuty';
  // [...]
    const http = HttpPostIngressEventPublisher.fromConfig({
      config: env.config,
      events: env.events,
      ingresses: {
+       pagerduty: {
+         validator: createPagerDutySignatureValidator(env.config),
+       },
     },
     logger: env.logger,
  });
```

## Configuration

```yaml
events:
  modules:
    pagerduty:
      webhookSecret: your-secret-token
```

Configuration at PagerDuty:
https://developer.pagerduty.com/docs/28e906a0e4f36-verifying-signatures
