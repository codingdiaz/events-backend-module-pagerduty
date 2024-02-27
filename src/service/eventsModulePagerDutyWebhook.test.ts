import { mockServices, startTestBackend } from "@backstage/backend-test-utils";
import { eventsExtensionPoint } from "@backstage/plugin-events-node/alpha";
import {
  HttpPostIngressOptions,
  RequestDetails,
} from "@backstage/plugin-events-node";
import { eventsModulePagerDutyWebhook } from "./eventsModulePagerDutyWebhook";
import { createHmac } from "crypto";

describe("eventsModulePagerDutyWebhook", () => {
  const secret = "valid-secret";
  const payload = { test: "payload" };
  const payloadString = JSON.stringify(payload);
  const validSignatureHeader = `v1=${createHmac("sha256", secret)
    .update(payloadString)
    .digest("hex")}`;

  const requestWithSignature = async (signature?: string) => {
    return {
      body: payload,
      headers: {
        "x-pagerduty-signature": signature,
      },
    } as RequestDetails;
  };

  it("should be correctly wired and set up", async () => {
    let addedIngress: HttpPostIngressOptions | undefined;
    const extensionPoint = {
      addHttpPostIngress: (ingress: any) => {
        addedIngress = ingress;
      },
    };

    await startTestBackend({
      extensionPoints: [[eventsExtensionPoint, extensionPoint]],
      features: [
        eventsModulePagerDutyWebhook(),
        mockServices.rootConfig.factory({
          data: {
            events: {
              modules: {
                pagerduty: {
                  webhookSecret: secret,
                },
              },
            },
          },
        }),
      ],
    });

    expect(addedIngress).not.toBeUndefined();
    expect(addedIngress?.topic).toEqual("pagerduty");
    expect(addedIngress?.validator).not.toBeUndefined();
    const rejections: any[] = [];
    const context = {
      reject: (details: { status?: any; payload?: any }) => {
        rejections.push(details);
      },
    };
    await addedIngress!.validator!(await requestWithSignature(), context);
    expect(rejections).toEqual([
      {
        status: 403,
        payload: {
          message: "invalid signature",
        },
      },
    ]);
    await addedIngress!.validator!(
      await requestWithSignature(validSignatureHeader),
      context
    );
    expect(rejections.length).toEqual(1);
  });
});
