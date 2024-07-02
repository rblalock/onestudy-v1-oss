import Head from "next/head";
import { useEffect } from "react";

import { Footer, Header } from "@/frontend/components/Home";
import SpotlightSection from "@/frontend/components/Home/sections/SpotlightSection";
import { useAnalytics } from "@/frontend/lib/analytics";

const MainPage = () => {
  const { logEvent } = useAnalytics();

  useEffect(() => {
    logEvent("landing_page_1.0", {
      usecase: "default",
    });
  }, [logEvent]);

  return (
    <>
      <Head>
        <title>Shopmonkey Research</title>
        <meta name="description" content="" key="desc" />
      </Head>

      <Header contentType={"default"} />

      <div className="min-h-screen flex-col w-full bg-black relative flex items-center justify-start overflow-hidden lg:overflow-clip">
        <div className="relative w-full bg-grid-small-white/[0.2]">
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_5%,black)]" />
          <div className="container relative">
            <SpotlightSection />
          </div>
        </div>

        <Footer contentType={"default"} />
      </div>
    </>
  );
};

export default MainPage;
