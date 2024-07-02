import "svix-react/style.css";

import React, { useEffect } from "react";
import { AppPortal } from "svix-react";

const WebhooksPage = () => {
  const [appPortal, setAppPortal] = React.useState<any>(null);

  useEffect(() => {
    fetch(`/api/webhooks/access`, { method: "POST" })
      .then((res) => res.json())
      .then((result) => setAppPortal(result));
  }, []);

  return (
    <div className="w-full mx-5">
      <h2 className="text-2xl mb-3">Webhook portal</h2>
      <p className="mb-5 text-sm leading-snug">
        Shopmonkey uses svix to manage webhooks. You can use the portal below to
        manage your webhooks.
        <br />
        For instructions such as verifying the webhook signature, please refer
        to the{" "}
        <a
          target="_blank"
          className="font-bold text-blue-500"
          href="https://docs.svix.com/receiving/introduction"
        >
          svix documentation
        </a>
        .
      </p>

      <AppPortal fullSize url={appPortal?.url} />
    </div>
  );
};

export default WebhooksPage;
