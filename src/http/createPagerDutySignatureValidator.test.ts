import { ConfigReader } from "@backstage/config";
import {
  RequestDetails,
  RequestRejectionDetails,
  RequestValidationContext,
} from "@backstage/plugin-events-node";
import { createPagerDutySignatureValidator } from "./createPagerDutySignatureValidator";
import { createHmac } from "crypto";

class TestContext implements RequestValidationContext {
  #details?: Partial<RequestRejectionDetails>;

  reject(details?: Partial<RequestRejectionDetails>): void {
    this.#details = details;
  }

  get details() {
    return this.#details;
  }
}

describe("createPagerDutySignatureValidator", () => {
  const secret = "valid-secret";
  const configWithoutSecret = new ConfigReader({});
  const configWithSecret = new ConfigReader({
    events: {
      modules: {
        pagerduty: {
          webhookSecret: secret,
        },
      },
    },
  });
  const payload = { event_type: "pagey.ping" };
  const payloadString = JSON.stringify(payload);
  const validSignatureHeader = `v1=${createHmac("sha256", secret)
    .update(payloadString)
    .digest("hex")}`;

  const requestWithSignature = async (signature: string | undefined) => {
    return {
      body: payload,
      headers: {
        "x-pagerduty-signature": signature,
      },
    } as RequestDetails;
  };

  it("no secret configured, throw error", async () => {
    expect(() =>
      createPagerDutySignatureValidator(configWithoutSecret)
    ).toThrow(
      "Missing required config value at 'events.modules.pagerduty.webhookSecret'"
    );
  });

  it("secret configured, reject request without signature", async () => {
    const request = await requestWithSignature(undefined);
    const context = new TestContext();

    const validator = createPagerDutySignatureValidator(configWithSecret);
    await validator(request, context);

    expect(context.details).not.toBeUndefined();
    expect(context.details?.status).toBe(403);
    expect(context.details?.payload).toEqual({ message: "invalid signature" });
  });

  it("secret configured, reject request with invalid signature", async () => {
    const request = await requestWithSignature("invalid signature");
    const context = new TestContext();

    const validator = createPagerDutySignatureValidator(configWithSecret);
    await validator(request, context);

    expect(context.details).not.toBeUndefined();
    expect(context.details?.status).toBe(403);
    expect(context.details?.payload).toEqual({ message: "invalid signature" });
  });

  it("secret configured, accept request with valid signature", async () => {
    const request = await requestWithSignature(validSignatureHeader);
    const context = new TestContext();

    const validator = createPagerDutySignatureValidator(configWithSecret);
    await validator(request, context);

    expect(context.details).toBeUndefined();
  });
});
