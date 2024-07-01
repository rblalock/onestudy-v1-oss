import { track } from "@vercel/analytics";
import { PostHogContext } from "posthog-js/react";
import { useContext } from "react";

export const useAnalytics = () => {
  const { client } = useContext(PostHogContext);

  const logEvent = (eventName: string, eventProperties?: any) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Analytics-Local]", eventName, eventProperties);
      return;
    }

    // PostHog event
    client.capture(eventName, eventProperties);
    // Vercel event
    track(eventName, eventProperties);
  };

  const identify = (id: string, payload?: any) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Analytics-Local]", "identify", id, payload);
      return;
    }
    client.identify(id, payload);
  };

  const group = (type: string, id: string) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Analytics-Local]", "group", type, id);
      return;
    }
    client.group(type, id);
  };

  return {
    logEvent,
    identify,
    group,
  };
};
