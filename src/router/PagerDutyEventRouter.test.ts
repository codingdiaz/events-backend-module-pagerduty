import { TestEventBroker } from "@backstage/plugin-events-backend-test-utils";
import { PagerDutyEventRouter } from "./PagerDutyEventRouter";

describe("PagerDutyEventRouter", () => {
  const eventRouter = new PagerDutyEventRouter();
  const topic = "pagerduty";
  const eventPayload = { event_type: "pagey.ping" };

  it("no event type", () => {
    const eventBroker = new TestEventBroker();
    eventRouter.setEventBroker(eventBroker);

    eventRouter.onEvent({ topic, eventPayload: {} });

    expect(eventBroker.published).toEqual([]);
  });

  it("with event type", () => {
    const eventBroker = new TestEventBroker();
    eventRouter.setEventBroker(eventBroker);

    eventRouter.onEvent({ topic, eventPayload });

    expect(eventBroker.published.length).toBe(1);
    expect(eventBroker.published[0].topic).toEqual("pagerduty.pagey.ping");
    expect(eventBroker.published[0].eventPayload).toEqual(eventPayload);
  });
});
