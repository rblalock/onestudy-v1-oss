import React, { useEffect, useState } from "react";

import { useAnalytics } from "@/frontend/lib/analytics";

import MovingButton from "../../ui/moving-border";
import { SparklesCore } from "./Sparkles";
import Spotlight from "./Spotlight";

const items = ["retention low", "churn high", "activation failing"];

const SpotlightSection = () => {
  const { logEvent } = useAnalytics();

  return (
    <>
      <Spotlight className="left-72 md:-top-10" fill="white" />

      <div className="w-[500px] h-40 absolute left-0 top-0">
        <div className="absolute inset-x-10 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute -inset-x-10 top-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-16 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-16 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={50}
          className="w-1/2 h-full ml-10"
          particleColor="#ffffff"
        />
      </div>

      <div className="h-[40rem] lg:mb-48 w-full flex md:items-center md:justify-center antialiased relative overflow-hidden text-white">
        <div className="p-4 lg:mt-32 max-w-7xl mx-auto relative z-10 w-full lg:pt-20 md:pt-0">
          <div className="md:flex justify-center mt-10 lg:pb-10">
            <MovingButton
              borderRadius="1.75rem"
              containerClassName="w-72"
              className="text-xl font-bold bg-slate-100 text-slate-900"
              borderClassName="hidden"
              onClick={() => {
                logEvent("go_to_studies", {
                  position: "hero",
                });
                window.open("/studies");
              }}
            >
              Login
            </MovingButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default SpotlightSection;
