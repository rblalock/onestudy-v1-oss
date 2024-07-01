import { buildClerkProps, clerkClient, getAuth } from "@clerk/nextjs/server";
import { GetServerSideProps } from "next";

import LayoutMain from "@/frontend/components/Layout/Main";

const Dashboard = () => {
  return (
    <LayoutMain>
      <div className="grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          Dashboard nav
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          Body area here
        </main>
      </div>
    </LayoutMain>
  );
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  const user = userId ? await clerkClient.users.getUser(userId) : undefined;

  return { props: { ...buildClerkProps(ctx.req, { user }) } };
};
