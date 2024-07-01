"use client";

import { Link1Icon, Link2Icon } from "@radix-ui/react-icons";
import { DeleteIcon, Share } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Markdown from "react-markdown";

import { Study, StudyInsight } from "@/core/studies/types";
import { InsightReferencedDocuments } from "@/core/vectorDocuments/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/components/ui/dialog";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import useDeleteStudyInsight from "@/frontend/hooks/studyInsights/useDeleteStudyInsight";
import useListStudyInsights from "@/frontend/hooks/studyInsights/useListStudyInsights";
import useUpdateStudyInsight from "@/frontend/hooks/studyInsights/useUpdateStudyInsight";
import useCopyToClipboard from "@/frontend/hooks/useCopyToClipboard";
import { useAnalytics } from "@/frontend/lib/analytics";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { toast } from "../../ui/use-toast";

const Insights = (props: { study?: Study }) => {
  const { logEvent } = useAnalytics();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState<string>();
  const [newStudyInsight, setNewStudyInsight] = useState<StudyInsight>();
  const {
    data: studyInsights,
    isLoading: loadingStudyInsights,
    isError,
  } = useListStudyInsights(props.study?.id);

  const generateInsight = async (query: string) => {
    const url = `/api/search/insights?studyId=${
      props.study?.id
    }&search=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
      toast({
        description: `Failed to create insight ${response.statusText}`,
        variant: "destructive",
      });
      logEvent("insight_search_failed", { statusText: response.statusText });
      return;
    }

    const json = await response.json();
    return json?.data as {
      id: string;
    };
  };

  const onSearch = async (payload: any) => {
    if (payload && payload.search) {
      const results = await generateInsight(payload.search);

      if (results && results?.id) {
        setLoading(true);
        setLoadingInsight(results.id);
      }
    }
  };

  useEffect(() => {
    if (loadingInsight) {
      const interval = setInterval(async () => {
        const url = `/api/insights/study/${props.study?.id}?id=${loadingInsight}`;
        const response = await fetch(url);
        const data: {
          success: boolean;
          data: StudyInsight;
        } = await response.json();

        if (data.data?.processing === false) {
          setLoading(false);
          clearInterval(interval);
          setLoadingInsight(undefined);
          setNewStudyInsight(data.data);

          logEvent("insights-search", {
            results: data.data.response?.documentReferenceIds?.length,
          });
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [loadingInsight, logEvent, props.study?.id]);

  if (!props.study) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center">
        <form onSubmit={handleSubmit(onSearch)} className="flex w-full">
          <div className="relative mr-1 w-full">
            <Input
              className="w-full"
              placeholder="Get answers to your study..."
              {...register("search", { required: true })}
            />
            {errors.search && (
              <span className="text-xs text-red-500">
                Fill in something first!
              </span>
            )}
          </div>

          <Button type="submit" size="default" className="w-48 ml-2">
            Get insights
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="my-5 px-2 w-full">
          <div className="flex items-center">
            <div className="mr-2 animate-spin rounded-full h-5 w-5 border-b-2 dark:border-slate-700 border-slate-300"></div>
            Creating insights...(this might take a minute or two)
          </div>
        </div>
      ) : null}

      {newStudyInsight ? (
        <div className="mt-5 mx-5 duration-1000 animate-in fade-in slide-in-from-top-5">
          <InsightComponent
            studyId={props.study?.id}
            response={newStudyInsight?.response?.explanation}
            referenceDocuments={newStudyInsight?.referencedDocuments}
            documentReferenceIds={
              newStudyInsight?.response?.documentReferenceIds
            }
            id={newStudyInsight?.id}
            question={newStudyInsight?.question}
            shared={newStudyInsight?.shared}
            keyQuote={newStudyInsight?.keyQuote}
            showDelete={false}
          />
        </div>
      ) : null}

      {studyInsights ? (
        <>
          <hr className="my-10 dark:border-slate-900 border-slate-200" />

          <h2 className="text-2xl font-bold mb-5">Saved insights</h2>

          <Accordion type="multiple" className="w-full">
            {studyInsights
              ?.filter((insight) => insight.processing !== true)
              .map((insight) => (
                <AccordionItem
                  key={insight.id}
                  value={insight.question}
                  className="dark:border-slate-700"
                >
                  <AccordionTrigger className="text-xl underline">
                    {insight.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <InsightComponent
                      id={insight.id}
                      studyId={props.study?.id}
                      question={insight.question}
                      response={insight.response?.explanation}
                      documentReferenceIds={
                        insight.response?.documentReferenceIds
                      }
                      referenceDocuments={insight.referencedDocuments}
                      shared={insight.shared}
                      keyQuote={insight.keyQuote}
                      showDelete
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </>
      ) : null}
    </div>
  );
};

export default Insights;

const InsightComponent = (props: {
  id?: string;
  studyId?: string;
  question?: string;
  response?: string;
  documentReferenceIds?: string[];
  referenceDocuments?: InsightReferencedDocuments[] | null;
  shared?: boolean;
  keyQuote?: string;
  showDelete?: boolean;
}) => {
  const [openShareModal, setShareModalOpen] = useState(false);
  const { mutateAsync } = useDeleteStudyInsight(props.studyId);
  const { mutateAsync: updateInsight } = useUpdateStudyInsight(
    props.studyId,
    props.id
  );
  const { register, handleSubmit, reset } = useForm();
  const [value, copy] = useCopyToClipboard();

  const deleteStudyInsight = async () => {
    if (props.id) {
      const results = await mutateAsync({
        id: props.id,
      });
      if (results.success) {
        toast({
          description: `Insight deleted`,
        });
      }
    }
  };

  const shareStudyInsight = async (data: { [key: string]: any }) => {
    await updateInsight({
      payload: {
        id: props.id,
        keyQuote: data.keyQuote,
        shared: true,
      },
    });

    handleCopy(
      `https://${process.env.NEXT_PUBLIC_DOMAIN_URL}/share/insight/${props.id}`
    );

    setShareModalOpen(false);
  };

  const disableSharedLink = async () => {
    await updateInsight({
      payload: {
        id: props.id,
        shared: false,
      },
    });

    setShareModalOpen(false);
    toast({
      description: "Disabled share link",
    });
  };

  const handleCopy = (url: string) => {
    copy(url);
    toast({
      description: "Copied to clipboard",
    });
  };

  return (
    <>
      <div className="w-full">
        <Markdown
          className="leading-relaxed w-full"
          components={{
            a(props) {
              const { node, ...rest } = props;
              return (
                <span className="text-blue-500 mx-1 text-xs">
                  <Link2Icon className="w-3 h-3 inline-block mr-1" />
                  <a className="" {...rest} />
                </span>
              );
            },
          }}
        >
          {props.response
            ? convertIdsToLinks(
                props.response || "",
                props.documentReferenceIds || [],
                props.studyId || ""
              )
            : "No insight found"}
        </Markdown>
      </div>

      {props.referenceDocuments ? (
        <>
          <h3 className="text-sm mt-5 font-bold">Referenced intervews:</h3>
          <div className="border dark:border-slate-800 border-slate-200 rounded-lg mt-2 px-5">
            {props.referenceDocuments?.map((document) => (
              <div key={document.documentReferenceId} className="my-5">
                <Link
                  href={`/studies/${props.studyId}/interview/${document.documentReferenceId}`}
                >
                  <h4 className="font-bold mb-1">{document.documentTitle}</h4>
                </Link>

                <div className="flex flex-wrap items-center">
                  {document.tags?.map((tag: any) => (
                    <mark
                      key={tag.tag}
                      className="rounded-lg px-1 py-1 mx-1 text-xs group relative bg-slate-900 text-slate-100 border-b-2"
                      style={{
                        borderColor: tag.color || "#84d2ff",
                        // cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      <span className="px-2 rounded-lg text-xs font-sans">
                        {tag.tag} <span className="ml-2">{tag.count}</span>
                      </span>
                    </mark>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {props.id ? (
            <div className={"flex items-center justify-between mt-3"}>
              {props.showDelete ? (
                <Button
                  size="sm"
                  variant="outline"
                  className=""
                  onClick={deleteStudyInsight}
                >
                  Delete insight
                  <DeleteIcon className="w-4 h-4 ml-2" />
                </Button>
              ) : null}

              <Dialog open={openShareModal} onOpenChange={setShareModalOpen}>
                <DialogTrigger type="button" asChild>
                  <Button size="sm" variant="outline">
                    Share insight
                    <Share className="w-4 h-4 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="">
                  <DialogHeader>
                    <DialogTitle>Share this insight</DialogTitle>
                    <DialogDescription>
                      Make this insight publicly available through a URL you can
                      share.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="">
                    <div className={""}>
                      <div className="mb-1 flex items-center">
                        <span className="font-bold">Share Link</span>
                        <Button
                          className="text-xs"
                          variant="link"
                          onClick={() =>
                            handleCopy(
                              `https://${process.env.NEXT_PUBLIC_DOMAIN_URL}/share/insight/${props.id}`
                            )
                          }
                        >
                          <Link1Icon className="w-4 h-4 mr-1" />
                          Click to copy
                        </Button>
                      </div>
                    </div>

                    <div className="">
                      <Label htmlFor="keyQuote" className="text-right">
                        Quote or key insight
                      </Label>
                      <Textarea
                        {...register("keyQuote", { minLength: 2 })}
                        defaultValue={props.keyQuote}
                        id="keyQuote"
                        className="col-span-3"
                      />
                    </div>
                    <div className="text-xs text-right">
                      Add some extra pizazz to your insight by adding a quote or
                      key insight.
                    </div>
                  </div>
                  <DialogFooter>
                    {props.shared ? (
                      <Button
                        onClick={disableSharedLink}
                        variant={"destructive"}
                      >
                        Disable share link
                      </Button>
                    ) : null}

                    <Button onClick={handleSubmit(shareStudyInsight)}>
                      Share URL
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
};

const convertIdsToLinks = (
  text: string,
  documentReferenceIDs: string[],
  studyId: string
): string => {
  if (documentReferenceIDs.length === 0) {
    return text;
  }

  const idRegex = new RegExp(documentReferenceIDs.join("|"), "g");
  return text.replace(
    idRegex,
    (matchedId) =>
      `[interview link](/studies/${studyId}/interview/${matchedId})`
  );
};
