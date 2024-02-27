import {
  EventParams,
  SubTopicEventRouter,
} from "@backstage/plugin-events-node";

/**
 * Subscribes to the generic `pagerduty` topic
 * and publishes the events under the more concrete sub-topic
 * depending on the `event.event_type` provided.
 *
 * @public
 */
export class PagerDutyEventRouter extends SubTopicEventRouter {
  constructor() {
    super("pagerduty");
  }

  protected determineSubTopic(params: EventParams): string | undefined {
    if (
      params.eventPayload &&
      params.eventPayload instanceof Object &&
      "event_type" in params.eventPayload
    ) {
      return params.eventPayload.event_type as string;
    }

    return undefined;
  }
}
