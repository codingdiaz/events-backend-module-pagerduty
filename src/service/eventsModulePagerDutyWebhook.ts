import {
  coreServices,
  createBackendModule,
} from "@backstage/backend-plugin-api";
import { eventsExtensionPoint } from "@backstage/plugin-events-node/alpha";
import { createPagerDutySignatureValidator } from "../http/createPagerDutySignatureValidator";

/**
 * Module for the events-backend plugin,
 * registering an HTTP POST ingress with request validator
 * which verifies the webhook signature based on a secret.
 *
 * @alpha
 */
export const eventsModulePagerDutyWebhook = createBackendModule({
  pluginId: "events",
  moduleId: "PagerDutyWebhook",
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        events: eventsExtensionPoint,
      },
      async init({ config, events }) {
        events.addHttpPostIngress({
          topic: "pagerduty",
          validator: createPagerDutySignatureValidator(config),
        });
      },
    });
  },
});
