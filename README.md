# PagerDuty Events Module for Backstage

A backstage module with events support for [PagerDuty webhook](https://support.pagerduty.com/docs/webhooks) events.

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
