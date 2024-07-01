import { LightningBoltIcon } from "@radix-ui/react-icons";
import { ChatCompletionRequestMessageRoleEnum } from "openai-edge";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Markdown from "react-markdown";

import { Interview } from "@/core/interviews/types";
import { interviewRoleLabelTransform } from "@/core/interviews/utils";
import { Annotation, GPTMessage } from "@/core/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/frontend/components/ui/accordion";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import { toast } from "@/frontend/components/ui/use-toast";
import useSummarize, {
  SummaryType,
} from "@/frontend/hooks/general/useSummarize";
import useInterview from "@/frontend/hooks/interviews/useInterview";
import useUpdateInterview from "@/frontend/hooks/interviews/useUpdateInterview";
import useCreateTag from "@/frontend/hooks/tags/useCreateTag";
import { useAnalytics } from "@/frontend/lib/analytics";

import { Annotator, AnnotatorWrapper } from "../TextAnnotator";

const InterviewPage = (props: { interviewId?: string }) => {
  const { logEvent } = useAnalytics();
  const { register, handleSubmit } = useForm();
  const { data, isLoading, isError, refetch } = useInterview(props.interviewId);
  const { mutateAsync: mutateInterview, isLoading: interviewIsUpdating } =
    useUpdateInterview(props.interviewId);
  const { mutateAsync: mutateTag, isLoading: tagIsCreating } = useCreateTag();
  const { mutateAsync } = useSummarize();
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  const regenerateSummary = async () => {
    if (!props.interviewId) {
      return;
    }

    const results = await mutateAsync({
      id: props.interviewId,
      type: SummaryType.Interview,
    });

    if (results.success) {
      toast({
        description: `Summary will be available soon`,
      });
      logEvent("interview_summary_regenerate", {
        interviewId: props.interviewId,
      });
    } else {
      toast({
        description: `Summary failed to generate, try again later please.`,
        variant: "destructive",
      });
      logEvent("interview_summary_regenerate_failed", {
        interviewId: props.interviewId,
      });
    }
  };

  const onInterviewUpdate = async (payload: Partial<Interview>) => {
    setIsEditingSummary(false);

    const results = await mutateInterview({
      payload: {
        ...payload,
      },
    });

    if (results.success) {
      toast({
        description: `Interview updated`,
      });
    } else {
      toast({
        description: `Interview failed to update`,
        variant: "destructive",
      });
    }
  };

  const onTagCreation = async (payload: { tag: string; color: string }) => {
    const results = await mutateTag({
      studyId: data?.studyId,
      tagName: payload.tag,
      color: payload.color,
    });

    if (!results.success) {
      toast({
        description: `The tag could not be created.  Please try again later.`,
        variant: "destructive",
      });
      logEvent("interview_tag_created_failed", {
        studyId: data?.studyId,
        interviewId: data?.id,
        tag: payload.tag,
      });
    } else {
      toast({ description: `Tag created` });
      logEvent("interview_tag_created", {
        studyId: data?.studyId,
        interviewId: data?.id,
        tag: payload.tag,
      });
    }
  };

  const onAnnotationUpdate = async (id: number, annotations: Annotation[]) => {
    if (!data?.rawMessages) {
      return;
    }

    const messages = [
      ...data.rawMessages.filter(
        (m) => m.role !== ChatCompletionRequestMessageRoleEnum.System,
      ),
    ];
    messages[id] = {
      ...messages[id],
      annotations,
    };

    const results = await mutateInterview({
      payload: {
        rawMessages: messages,
      },
    });

    refetch();

    if (results.success) {
      toast({
        description: `Annotation saved`,
      });
      logEvent("interview_annotation_saved", { interviewId: data?.id });
    } else {
      toast({
        description: `Annotation failed to save`,
        variant: "destructive",
      });
      logEvent("interview_annotation_saved_failed", { interviewId: data?.id });
    }
  };

  const usedTags = useMemo(() => {
    if (!data?.rawMessages) {
      return {};
    }

    const tags: {
      [key: string]: {
        tag: string;
        color: string | undefined;
        count: number;
      };
    } = {};
    data.rawMessages.forEach((message) => {
      if (message.annotations) {
        message.annotations.forEach((annotation) => {
          if (annotation.tag) {
            if (!tags[annotation.tag]) {
              tags[annotation.tag] = {
                tag: annotation.tag,
                color: annotation.color,
                count: 1,
              };
            } else {
              tags[annotation.tag] = {
                tag: annotation.tag,
                color: annotation.color,
                count: tags[annotation.tag].count + 1,
              };
            }
          }
        });
      }
    });

    return tags;
  }, [data?.rawMessages]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>This interview is no longer available</div>;
  }

  return (
    <div className="">
      <div className="grid w-full gap-1.5">
        <h3 className="text-2xl flex items-center mb-2">
          Interviewed on
          <span className="ml-2 text-gray-700 dark:text-gray-400">
            {new Date(data?.createdAt || "").toLocaleDateString("en-US")}
          </span>
        </h3>

        <div
          className={`${interviewIsUpdating ? "pointer-events-none" : ""} relative`}
        >
          <div
            onClick={() => setIsEditingSummary(true)}
            className="dark:hover:bg-slate-900 hover:bg-slate-100 py-1 rounded-lg hover:cursor-pointer"
          >
            {isEditingSummary ? (
              <>
                <p className="text-sm">Interview title</p>
                <Input
                  className={"w-2/4"}
                  placeholder="Enter a title for the interview page"
                  defaultValue={data?.summaryTitle}
                  {...register("summaryTitle", { minLength: 2 })}
                />
              </>
            ) : (
              <h2 className="text-2xl font-bold">{data?.summaryTitle}</h2>
            )}
          </div>

          {data?.sentiment ? (
            <div className="">
              <span className="text-xs">Overall Sentiment:</span>
              <span className="text-xs ml-1 font-bold">{data?.sentiment}</span>
            </div>
          ) : null}

          {data?.rawMessages ? (
            <div className="">
              <span className="text-xs">Tag Highlights:</span>
              {usedTags && Object.values(usedTags).length > 0 ? (
                <div className="flex flex-wrap">
                  {Object.values(usedTags).map((tag) => (
                    <mark
                      key={tag.tag}
                      className="rounded-lg px-3 py-1 mx-1 text-sm group relative bg-slate-900 font-bold text-slate-100 border-b-4"
                      style={{
                        borderColor: tag.color || "#84d2ff",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      <span className="px-2 rounded-lg text-xs font-sans">
                        {tag.tag} <span className="ml-2">{tag.count}</span>
                      </span>
                    </mark>
                  ))}
                </div>
              ) : (
                <span className="text-xs">No tags used in this interview.</span>
              )}
            </div>
          ) : (
            <span>No conversation was recorded.</span>
          )}

          <hr className="my-5 dark:border-slate-900 border-slate-100" />

          {data?.summary ? (
            <div className="prose dark:prose-invert">
              {isEditingSummary ? (
                <div className="">
                  <Textarea
                    className="bg-white dark:bg-black min-h-[250px] text-base"
                    placeholder="The interview summary"
                    id="summary"
                    defaultValue={data?.summary}
                    {...register("summary", { minLength: 2 })}
                  />
                  <div className="flex mt-2">
                    <p className="text-xs flex-1">Markdown supported</p>

                    <Button
                      variant="outline"
                      onClick={() => setIsEditingSummary(false)}
                      className="animate-in fade-in zoom-in-60 mr-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit(onInterviewUpdate)}
                      className="animate-in fade-in zoom-in-60 mr-2"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingSummary(true)}
                  className="dark:hover:bg-slate-900 hover:bg-slate-100 px-5 py-1 rounded-lg hover:cursor-pointer"
                >
                  <Markdown>{data?.summary}</Markdown>
                </div>
              )}

              <Button
                variant="outline"
                className="mt-2"
                onClick={regenerateSummary}
              >
                <LightningBoltIcon className="w-4 h-4 mr-2" />
                Re-create summary
              </Button>
            </div>
          ) : (
            <span>A summary is not available yet for this interview.</span>
          )}
        </div>

        <Accordion type="multiple" className="w-full">
          <AccordionItem value="item-1" className="dark:border-slate-700">
            <AccordionTrigger className="text-xl underline">
              Respondent information
            </AccordionTrigger>
            <AccordionContent>
              {data?.userMetaData ? (
                <div className="prose dark:prose-invert">
                  {Object.entries(data.userMetaData)
                    .slice(0, 2)
                    .map(([key, value]) => (
                      <div key={key} className="mb-2">
                        {/* <span className="font-bold">{key}</span>
											<br /> */}
                        {value}
                      </div>
                    ))}
                </div>
              ) : (
                <span>
                  No user information was retrieved for this interview.
                </span>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <h2 className="text-2xl font-bold mt-5">Transcript</h2>

        {data?.rawMessages ? (
          <div className="border dark:border-slate-800 rounded-lg p-2">
            <AnnotatorWrapper
              studyId={data.studyId}
              interviewId={data.id}
              onTagCreation={onTagCreation}
              onAnnotationUpdate={onAnnotationUpdate}
            >
              {data.rawMessages
                .filter(
                  (m) => m.role !== ChatCompletionRequestMessageRoleEnum.System,
                )
                .map((message, index) => (
                  <div
                    key={index}
                    className={`mb-5 px-2 prose dark:prose-invert ${message.role === ChatCompletionRequestMessageRoleEnum.User ? "bg-slate-200 dark:bg-slate-900 p-3 rounded-lg" : ""}`}
                  >
                    <span className="font-bold">
                      {interviewRoleLabelTransform(message.role)}
                    </span>
                    <br />
                    <Annotator
                      content={message.content}
                      annotations={message.annotations}
                      id={index}
                    />
                  </div>
                ))}
            </AnnotatorWrapper>
          </div>
        ) : (
          <span>No conversation was recorded.</span>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;
