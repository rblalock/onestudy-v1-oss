import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import Markdown from "react-markdown";

import { Study, StudyStatus } from "@/core/studies/types";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { toast } from "@/frontend/components/ui/use-toast";
import { ModeToggle } from "@/frontend/components/Utils/ThemeProvider";
import useCreateInterview from "@/frontend/hooks/interviews/useCreateInterview";
import { getStudy } from "@/server/data/study";

const mainColor = "#3752dc";

type StudyLinkProps = {
  study?: Partial<Study>;
};

export default function LinkInterview(props: StudyLinkProps) {
  const router = useRouter();
  const { mutateAsync } = useCreateInterview();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [isStarting, setIsStarting] = useState(false);

  const startInterview = async (data?: FieldValues) => {
    const results = await mutateAsync({
      studyId: props.study?.id,
      userMetaData: data,
    });

    if (results && !results.success) {
      toast({
        description: `The interview could not be started.  Please try again later.`,
        variant: "destructive",
      });
      setIsStarting(false);
    } else {
      router.push(`/interview/${results?.id}`);
    }
  };

  const handleUserFields = async (data: FieldValues) => {
    setIsStarting(true);
    await startInterview(data);
  };

  return (
    <>
      <Head>
        <title>
          {props.study?.meta?.shareTitle || "We need your feedback!"}
        </title>
        <meta
          property="og:title"
          content={props.study?.meta?.shareTitle || "We need your feedback!"}
        />
        <meta
          property="og:image"
          content={`/api/og?title=${encodeURIComponent(
            props.study?.meta?.shareTitle || "We need your feedback!",
          )}`}
        />
      </Head>

      <div className="relative isolate overflow-hidden bg-white dark:bg-stone-950 min-h-screen flex-col items-center justify-between">
        <div
          className={`w-full h-32 lg:h-64`}
          style={{
            backgroundColor: props.study?.meta?.primaryColor || mainColor,
          }}
        >
          <div
            className={`w-full h-32 lg:h-64 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-500 via-gray-800 to-black opacity-30`}
          />
        </div>

        <div className="absolute top-2 right-2">
          <ModeToggle />
        </div>

        <div className="relative w-5/6 lg:w-2/5 mx-auto pb-24 pt-10 lg:flex px-8 -mt-12 lg:-mt-32 bg-white dark:bg-black rounded-lg shadow-lg z-10">
          <div
            className={"flex w-full flex-1 flex-col items-center space-y-10"}
          >
            {props.study?.meta?.imageUrl ? (
              <img
                src={props.study?.meta?.imageUrl}
                className={
                  "w-32 h-32 object-contain rounded-lg dark:bg-white p-3"
                }
                alt=""
              />
            ) : null}

            {props.study?.status !== StudyStatus.ACTIVE ? (
              <div>This link is no longer active.</div>
            ) : (
              <>
                <h1
                  className={
                    "text-center text-4xl text-black dark:text-white" +
                    " flex flex-col space-y-1 font-heading font-medium"
                  }
                >
                  <span>
                    {props.study?.meta?.shareTitle || "We need your feedback!"}
                  </span>
                </h1>

                <div
                  className={
                    "text-center text-gray-700 dark:text-gray-300" +
                    " flex max-w-lg flex-col space-y-1 font-heading md:w-full"
                  }
                >
                  <Markdown className="prose dark:prose-invert">
                    {props.study?.meta?.shareDescription ||
                      "Thank you for taking the time and talking with us.  We have just a few things to ask you..."}
                  </Markdown>
                </div>

                {props.study?.userMetaData?.length ? (
                  <div
                    className={
                      "text-center text-gray-900 dark:text-white" +
                      " flex flex-col space-y-1 font-heading w-full lg:w-2/3"
                    }
                  >
                    <form
                      className={""}
                      onSubmit={handleSubmit(handleUserFields)}
                    >
                      <div className="flex flex-col space-y-4 mb-10 text-left">
                        {props.study?.userMetaData.map((metaData) => (
                          <Label key={metaData.key}>
                            {metaData.label}
                            {errors[metaData.label] && (
                              <div className="text-xs text-red-500">
                                {errors[metaData.key]?.message?.toString()}
                              </div>
                            )}
                            <Input
                              className={"w-full mt-2"}
                              type={metaData.type || "text"}
                              {...register(metaData.key, {
                                required:
                                  metaData.required &&
                                  "This must be provided to continue.",
                              })}
                            />
                          </Label>
                        ))}

                        {props.study?.userMetaData?.find(
                          (metaData) => metaData.type === "email",
                        ) ? (
                          <div>
                            <Label>
                              Would you like a transcript of this conversation
                              emailed to you?
                              <input
                                type="checkbox"
                                className={"ml-2"}
                                {...register("transcriptOptIn")}
                              />
                            </Label>
                          </div>
                        ) : null}
                      </div>

                      <div className={"flex justify-center space-x-2 w-full"}>
                        <Button
                          size="lg"
                          disabled={isStarting}
                          className={"flex justify-center mx-auto"}
                          type="submit"
                        >
                          <span className="flex items-center space-x-2 font-bold">
                            <span>
                              {isStarting
                                ? "Starting interview..."
                                : "Get started"}
                            </span>
                          </span>
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    disabled={isStarting}
                    className={"flex justify-center mx-auto"}
                    data-cy={"invite-form-link"}
                    type="button"
                    onClick={() => startInterview()}
                  >
                    <span className="flex items-center space-x-2 font-bold">
                      <span>
                        {isStarting ? "Starting interview..." : "Get started"}
                      </span>

                      <ArrowRightCircleIcon className="h-5" />
                    </span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mx-auto w-full flex justify-center mt-10 mb-5 text-xs text-gray-400">
          <a href="https://shopmonkey.io">
            Powered by <strong>Shopmonkey</strong>
          </a>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const study = await getStudy(ctx.params?.id as string);

  if (!study) {
    return {
      props: {
        study: {
          status: StudyStatus.INACTIVE,
        },
      },
    };
  }

  return {
    props: {
      study: {
        id: study?.id,
        name: study?.name,
        meta: study?.meta,
        userMetaData: study?.userMetaData || null,
        status: study?.status,
      },
      ...ctx.params,
    },
  };
};
