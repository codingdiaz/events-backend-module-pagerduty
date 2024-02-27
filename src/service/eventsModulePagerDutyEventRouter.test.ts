import { startTestBackend } from "@backstage/backend-test-utils";
import { eventsExtensionPoint } from "@backstage/plugin-events-node/alpha";
import { eventsModulePagerDutyEventRouter } from "./eventsModulePagerDutyEventRouter";
import { PagerDutyEventRouter } from "../router/PagerDutyEventRouter";

describe("eventsModulePagerDutyEventRouter", () => {
  it("should be correctly wired and set up", async () => {
    let addedPublisher: PagerDutyEventRouter | undefined;
    let addedSubscriber: PagerDutyEventRouter | undefined;
    const extensionPoint = {
      addPublishers: (publisher: any) => {
        addedPublisher = publisher;
      },
      addSubscribers: (subscriber: any) => {
        addedSubscriber = subscriber;
      },
    };

    await startTestBackend({
      extensionPoints: [[eventsExtensionPoint, extensionPoint]],
      features: [eventsModulePagerDutyEventRouter()],
    });

    expect(addedPublisher).not.toBeUndefined();
    expect(addedPublisher).toBeInstanceOf(PagerDutyEventRouter);
    expect(addedSubscriber).not.toBeUndefined();
    expect(addedSubscriber).toBeInstanceOf(PagerDutyEventRouter);
  });
});
