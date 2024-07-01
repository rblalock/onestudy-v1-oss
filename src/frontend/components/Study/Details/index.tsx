import {
  ChatBubbleIcon,
  InfoCircledIcon,
  Link2Icon,
  TextAlignLeftIcon,
} from "@radix-ui/react-icons";
import { BotIcon, CodeIcon, FormInputIcon, ForwardIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Study, StudyStatus, StudyUserMetaData } from "@/core/studies/types";
import KeyValueForm from "@/frontend/components/KeyValueForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { TextareaWithSave } from "@/frontend/components/ui/textarea";
import { toast } from "@/frontend/components/ui/use-toast";
import useSummarize, {
  SummaryType,
} from "@/frontend/hooks/general/useSummarize";
import useUpdateStudy from "@/frontend/hooks/studies/useUpdateStudy";
import { useAnalytics } from "@/frontend/lib/analytics";

import EmbedField from "../../EmbedField";
import { Button } from "../../ui/button";
import { InterviewerSelector } from "./interviewerSelector";
import { NumberOfQuestionsSelector } from "./numberOfQuestions";
import { StudyStatusSelector } from "./studyStatusSelector";
import { ModalSelector } from "./modalSelector";

const Details = (props: { study?: Study }) => {
  const { logEvent } = useAnalytics();
  const { mutateAsync, isLoading, isError } = useUpdateStudy(props.study?.id);
  const { mutateAsync: summarizeStudy } = useSummarize();
  const [requiredFields, setRequiredFields] = useState({
    title: false,
    closingQuestion: false,
    firstQuestion: false,
    generalInformation: false,
    interviewerType: false,
  });

  const handleUserMetaSave = (values: StudyUserMetaData[]) => {
    onDetailUpdate({
      userMetaData: values,
    });
  };

  const onDetailUpdate = async (payload: Partial<Study>) => {
    const results = await mutateAsync({
      payload: {
        ...payload,
      },
    });

    if (results.success) {
      toast({
        description: `Study updated`,
      });
      logEvent("study_details_updated", { studyId: props.study?.id });
    } else {
      toast({
        description: `Study failed to update`,
        variant: "destructive",
      });
      logEvent("study_details_updated_failed", { studyId: props.study?.id });
    }
  };

  const onQuestionAmountCommit = async (value: number) => {
    onDetailUpdate({
      meta: {
        ...props.study?.meta,
        followUpQuestionNumber: value,
      },
    });
  };

  const onInterviewerChange = async (value: string) => {
    setRequiredFields({
      ...requiredFields,
      interviewerType: true,
    });
    onDetailUpdate({
      interviewerStyle: value,
    });
  };

  const onModalityChange = async (value: string) => {
    onDetailUpdate({
      meta: {
        ...props.study?.meta,
        audioEnabled: value === "Enabled" ? true : false,
      },
    });
  };

  const onStudyStatusChange = async (value: StudyStatus) => {
    if (
      !requiredFields.title ||
      !requiredFields.closingQuestion ||
      !requiredFields.firstQuestion ||
      !requiredFields.generalInformation ||
      !requiredFields.interviewerType
    ) {
      toast({
        description: `You must fill out all required fields before you can change the status of the study.`,
        variant: "destructive",
      });
      return;
    }

    onDetailUpdate({
      status: value,
    });

    if (value === StudyStatus.COMPLETED) {
      if (!props.study?.id) {
        return;
      }

      const results = await summarizeStudy({
        id: props.study?.id,
        type: SummaryType.Study,
      });

      if (results.success) {
        toast({
          description: `Summary will be available soon`,
        });
      } else {
        toast({
          description: `Summary failed to generate, try again later please.`,
          variant: "destructive",
        });
      }
    }
  };

  const handleCustomStyleChange = (value?: string) => {
    if (value) {
      onDetailUpdate({
        interviewerStyleCustomMessage: value,
      });
    }
  };

  const handleTitleChange = (value?: string) => {
    if (value) {
      setRequiredFields({
        ...requiredFields,
        title: true,
      });
      onDetailUpdate({
        name: value,
      });
    }
  };

  const handleGeneralStudyChange = (value?: string) => {
    if (value) {
      setRequiredFields({
        ...requiredFields,
        generalInformation: true,
      });
      onDetailUpdate({
        meta: {
          ...props.study?.meta,
          generalInformation: value,
        },
      });
    }
  };

  const handleFirstQuestionChange = (value?: string) => {
    if (value) {
      setRequiredFields({
        ...requiredFields,
        firstQuestion: true,
      });
      onDetailUpdate({
        meta: {
          ...props.study?.meta,
          firstQuestion: value,
        },
      });
    }
  };

  const handleClosingCommentsChange = (value?: string) => {
    if (value) {
      setRequiredFields({
        ...requiredFields,
        closingQuestion: true,
      });
      onDetailUpdate({
        meta: {
          ...props.study?.meta,
          farewellMessage: value,
        },
      });
    }
  };

  const handleEmbedLinkChange = (value?: string[]) => {
    if (value && value.length > 0) {
      onDetailUpdate({
        meta: {
          ...props.study?.meta,
          embedUrls: value,
        },
      });
    } else {
      onDetailUpdate({
        meta: {
          ...props.study?.meta,
          embedUrls: undefined,
        },
      });
    }
  };

  // Quick validation check
  useEffect(() => {
    setRequiredFields({
      title: props.study?.name ? true : false,
      closingQuestion: props.study?.meta?.farewellMessage ? true : false,
      firstQuestion: props.study?.meta?.firstQuestion ? true : false,
      generalInformation: props.study?.meta?.generalInformation ? true : false,
      interviewerType: props.study?.interviewerStyle ? true : false,
    });
  }, [props.study]);

  if (!props.study) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total # of questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NumberOfQuestionsSelector
              defaultValue={[props.study?.meta?.followUpQuestionNumber || 5]}
              onCommit={onQuestionAmountCommit}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Interviewer style
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-2">
            <div className="">
              <InterviewerSelector
                onChange={onInterviewerChange}
                defaultValue={props.study.interviewerStyle}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study status</CardTitle>
          </CardHeader>
          <CardContent className="mt-2">
            <div className="">
              {!requiredFields.title ||
              !requiredFields.closingQuestion ||
              !requiredFields.firstQuestion ||
              !requiredFields.generalInformation ||
              !requiredFields.interviewerType ? (
                <div className="text-xs">Fill in required fields first</div>
              ) : (
                <StudyStatusSelector
                  onChange={onStudyStatusChange}
                  defaultValue={props.study.status}
                />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Audio transcription enabled
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-2">
            <div className="">
              <ModalSelector
                onChange={onModalityChange}
                defaultValue={
                  props.study.meta?.audioEnabled ? "Enabled" : "Disabled"
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        {/* Custom prompt/style */}
        {props.study.interviewerStyle === "Custom" ? (
          <div className="grid w-full gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 p-5 rounded-xl hover:shadow bg-slate-100 dark:bg-slate-900">
            <h3 className="text-2xl flex items-center mb-2">
              <BotIcon className="w-6 h-6 mr-2" />
              Custom interview prompt
            </h3>
            <TextareaWithSave
              className="bg-white dark:bg-black min-h-[10px]"
              placeholder="Your custom interview prompt"
              id="interviewerStyleCustomMessage"
              defaultValue={props.study?.interviewerStyleCustomMessage}
              onSave={handleCustomStyleChange}
            />
          </div>
        ) : null}

        <div className="grid w-full gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 p-5 rounded-xl hover:shadow">
          <h3 className="text-2xl flex items-center mb-2">
            <TextAlignLeftIcon className="w-6 h-6 mr-2" />
            Study title
          </h3>
          <TextareaWithSave
            className="bg-white dark:bg-black min-h-[10px]"
            placeholder="The study name"
            id="studyTitle"
            rows={2}
            defaultValue={props.study?.name}
            onSave={handleTitleChange}
          />
        </div>

        <div className="grid w-full gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 p-5 rounded-xl hover:shadow">
          <h3 className="text-2xl flex items-center mb-2">
            <InfoCircledIcon className="w-6 h-6 mr-2" />
            Study goal
          </h3>
          <p className="text-sm mb-2 dark:text-gray-400 text-gray-600">
            Provide a brief description of the study, what you’re trying to
            learn, important context the interviewer needs to know, and how
            you’re going to use the information. We will use this to help guide
            the questions and interview. We support multiple languages; simply
            state what language you'd like the interview to be conducted in.
            &nbsp;<strong>Note: The respondent will not see this.</strong>
          </p>
          <TextareaWithSave
            className="bg-white dark:bg-black"
            placeholder="Enter in your study information..."
            id="generalInformation"
            defaultValue={props.study?.meta?.generalInformation}
            onSave={handleGeneralStudyChange}
          />
        </div>

        <div className="grid w-full gap-1.5 mt-10 hover:bg-slate-100 dark:hover:bg-slate-900 p-5 rounded-xl hover:shadow">
          <h3 className="text-2xl flex items-center mb-2">
            <ForwardIcon className="w-6 h-6 mr-2" />
            First / leading question
            <div className="flex-1" />
            {/* TODO: Get a recommendation */}
            {/* <div className="">
							<Popover>
								<PopoverTrigger asChild>
									<Button variant="outline">
										<LightningBoltIcon className="w-4 h-4 mr-2" />
										Get a recommendation
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-80">
									<div className="grid gap-4">
										<div className="space-y-2">
											<h4 className="font-medium leading-none flex items-center">
												Recommendation

												<div className="flex-1" />

												<Button variant="outline" size="icon">
													<RefreshCcw className="w-4 h-4" />
												</Button>
											</h4>
											<p className="text-sm">
												Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ipsa laborum ipsam mollitia exercitationem, quia corporis ex reiciendis quidem atque dolorum cumque laudantium, unde autem consectetur architecto distinctio, asperiores odio. Modi!
											</p>
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</div> */}
          </h3>
          <TextareaWithSave
            className="bg-white dark:bg-black"
            placeholder="Enter in the first question that starts the interview..."
            id="firstQuestion"
            defaultValue={props.study?.meta?.firstQuestion}
            onSave={handleFirstQuestionChange}
          />
          <p className="text-sm mt-2 dark:text-gray-400 text-gray-600">
            Provide the first question you want to ask the respondent. This will
            be the first question they see when they start the study, after
            that, follow up questions will be AI driven, based on your study
            information.
          </p>
        </div>

        <div className="grid w-full gap-1.5 mt-10 hover:bg-slate-100 dark:hover:bg-slate-900 p-5 rounded-xl hover:shadow">
          <h3 className="text-2xl flex items-center mb-2">
            <Link2Icon className="w-6 h-6 mr-2" />
            Embed link
          </h3>
          <EmbedField
            data={props.study.meta?.embedUrls}
            onSave={handleEmbedLinkChange}
          />
          <p className="text-sm mt-2 dark:text-gray-400 text-gray-600">
            If you have something you'd like a respondent to view before they
            start the interview, provide the link here.
            <br />
            <strong>Currently only supports Loom video links.</strong>
          </p>
        </div>

        <div className="grid w-full gap-1.5 mt-10 hover:bg-slate-100 dark:hover:bg-slate-900 p-5 rounded-xl hover:shadow">
          <h3 className="text-2xl flex items-center mb-2">
            <ChatBubbleIcon className="w-6 h-6 mr-2" />
            Closing comments
            <div className="flex-1" />
            {/* TODO: Get a recommendation */}
            {/* <div className="">
							<Popover>
								<PopoverTrigger asChild>
									<Button variant="outline">
										<LightningBoltIcon className="w-4 h-4 mr-2" />
										Get a recommendation
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-80">
									<div className="grid gap-4">
										<div className="space-y-2">
											<h4 className="font-medium leading-none flex items-center">
												Recommendation

												<div className="flex-1" />

												<Button variant="outline" size="icon">
													<RefreshCcw className="w-4 h-4" />
												</Button>
											</h4>
											<p className="text-sm">
												Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ipsa laborum ipsam mollitia exercitationem, quia corporis ex reiciendis quidem atque dolorum cumque laudantium, unde autem consectetur architecto distinctio, asperiores odio. Modi!
											</p>
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</div> */}
          </h3>
          <TextareaWithSave
            className="bg-white dark:bg-black"
            placeholder="Enter in any closing comments or farewell message..."
            id="closingComments"
            defaultValue={props.study?.meta?.farewellMessage}
            onSave={handleClosingCommentsChange}
          />
          <p className="text-sm mt-2 dark:text-gray-400 text-gray-600">
            Provide farewell text at the end of the interview. You may use
            markdown, link to something else or just say goodbye.
          </p>
        </div>

        <div className="grid w-full gap-1.5 mt-10 hover:bg-slate-100 dark:hover:bg-slate-900 p-5 rounded-xl hover:shadow">
          <h3 className="text-2xl flex items-center mb-2">
            <FormInputIcon className="w-6 h-6 mr-2" />
            Collect respondent information
          </h3>

          <p className="text-sm dark:text-gray-400 text-gray-600">
            You can decide what kind of information you want to collect from the
            respondent by adding custom fields below.
          </p>

          <div className="mt-5">
            <KeyValueForm
              data={props.study.userMetaData}
              onSave={handleUserMetaSave}
            />
          </div>

          <hr className="my-5 dark:border-slate-900 border-slate-200" />

          <Button
            size="sm"
            variant="outline"
            className="ml-2 mb-5 animate-in fade-in zoom-in-60 w-64"
          >
            <Link href={`/studies/${props.study.id}/share`} className="w-full">
              Continue to the share page
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Details;
