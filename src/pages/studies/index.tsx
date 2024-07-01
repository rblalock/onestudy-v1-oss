import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

import LayoutMain from "@/frontend/components/Layout/Main";
import StudiesTable from "@/frontend/components/Studies/StudiesTable";
import { useAnalytics } from "@/frontend/lib/analytics";

const Studies = () => {
  const { isLoaded, userId, sessionId, orgId } = useAuth();
  const { identify, group } = useAnalytics();

  useEffect(() => {
    if (isLoaded && userId && sessionId) {
      identify(userId, {
        sessionId: sessionId,
        organizationId: orgId,
      });
      if (orgId) {
        group("company", orgId);
      }
    }
  }, [group, identify, isLoaded, orgId, sessionId, userId]);

  return (
    <LayoutMain>
      <main className="">
        <StudiesTable />
      </main>
    </LayoutMain>
  );
};

export default Studies;
