import { Config } from "@backstage/config";
import {
  RequestDetails,
  RequestValidationContext,
  RequestValidator,
} from "@backstage/plugin-events-node";
import { createHmac } from "crypto";

/**
 * Validates that the request received is the expected PagerDuty request
 * using the signature received with the `x-pagerDuty-signature` header
 * which is based on a secret token configured at PagerDuty and here.
 *
 * See https://developer.pagerduty.com/docs/28e906a0e4f36-verifying-signatures
 * for more details.
 *
 * @param config - root config
 * @public
 */
export function createPagerDutySignatureValidator(
  config: Config
): RequestValidator {
  const secret = config.getString("events.modules.pagerduty.webhookSecret");
  const version = "v1";

  return async (
    request: RequestDetails,
    context: RequestValidationContext
  ): Promise<void> => {
    if (!("x-pagerduty-signature" in request.headers)) {
      return context.reject({
        status: 403,
        payload: {
          message: "invalid signature",
        },
      });
    }

    const signatures = request.headers["x-pagerduty-signature"] as
      | string
      | undefined;

    if (!signatures) {
      return context.reject({
        status: 403,
        payload: {
          message: "invalid signature",
        },
      });
    }

    const signature = createHmac("sha256", secret)
      .update(JSON.stringify(request.body))
      .digest("hex");

    const signatureWithVersion = `${version}=${signature}`;
    const signatureList = signatures.split(",");

    if (signatureList.indexOf(signatureWithVersion) > -1) {
      return undefined;
    }

    return context.reject({
      status: 403,
      payload: {
        message: "invalid signature",
      },
    });
  };
}
