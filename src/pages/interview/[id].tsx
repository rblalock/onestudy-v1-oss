import { GetServerSidePropsContext } from "next";

import { InterviewCache } from "@/core/interviews/types";
import ConversationWrapper from "@/frontend/components/Conversation";
import { ModeToggle } from "@/frontend/components/Utils/ThemeProvider";
import { getInterview } from "@/server/edgeData/interview";

type InterviewLinkProps = {
  interview?: Partial<InterviewCache>;
};

export default function LinkInterview(props: InterviewLinkProps) {
  return (
    <div className="relative isolate overflow-hidden dark:bg-stone-950 min-h-screen flex-col items-center justify-between">
      {/* Header */}
      <div className="w-full flex justify-between items-center px-3 py-5">
        {props.interview?.study?.meta?.imageUrl ? (
          <img
            src={props.interview?.study?.meta?.imageUrl}
            className={"w-20 h-20 object-contain rounded-lg dark:bg-white p-1"}
          />
        ) : null}

        <div className="font-bold text-sm px-3 text-center">
          <span>
            {props.interview?.study?.meta?.shareTitle ||
              "We need your feedback!"}
          </span>
        </div>

        <div className="">
          <ModeToggle />
        </div>
      </div>

      {/* Conversation */}
      <div className="mx-auto px-2 pb-24 pt-5 lg:pt-20 sm:pb-32 lg:flex lg:px-8">
        <div className="flex w-full flex-1 flex-col items-center">
          <ConversationWrapper interview={props.interview} />
        </div>
      </div>

      {/* Footer */}
      <div className="absolute inset-x-0 bottom-0">
        {/* Footer */}
        <div className="flex items-center justify-between m-5 text-xs text-gray-400">
          <a href="https://shopmonkey.io">
            Powered by <strong>Shopmonkey</strong>
          </a>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const interview = await getInterview(ctx.params?.id as string);

  return {
    props: {
      interview: {
        id: interview?.id,
        rawMessages: interview?.rawMessages,
        studyId: interview?.studyId,
        study: {
          name: interview?.study?.name,
          interviewerStyle: interview?.study?.interviewerStyle,
          meta: interview?.study?.meta,
        },
      },
      ...ctx.params,
    },
  };
};
