import { createBackendModule } from "@backstage/backend-plugin-api";
import { eventsExtensionPoint } from "@backstage/plugin-events-node/alpha";
import { PagerDutyEventRouter } from "../router/PagerDutyEventRouter";

/**
 * Module for the events-backend plugin, adding an event router for PagerDuty.
 *
 * Registers the `PagerDutyEventRouter`.
 *
 * @alpha
 */
export const eventsModulePagerDutyEventRouter = createBackendModule({
  pluginId: "events",
  moduleId: "pagerduty-event-router",
  register(env) {
    env.registerInit({
      deps: {
        events: eventsExtensionPoint,
      },
      async init({ events }) {
        const eventRouter = new PagerDutyEventRouter();
        events.addPublishers(eventRouter);
        events.addSubscribers(eventRouter);
      },
    });
  },
});
