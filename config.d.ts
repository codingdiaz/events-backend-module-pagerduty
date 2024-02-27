export interface Config {
  events?: {
    modules?: {
      /**
       * events-backend-module-pagerduty plugin configuration.
       */
      pagerduty?: {
        /**
         * Secret token for webhook requests.
         *
         * @visibility secret
         */
        webhookSecret?: string;
      };
    };
  };
}
