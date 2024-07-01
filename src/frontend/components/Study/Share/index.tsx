import {
  Cross1Icon,
  Link1Icon,
  MinusIcon,
  PlusIcon,
  Share2Icon,
} from "@radix-ui/react-icons";
import { MailIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { useForm } from "react-hook-form";

import { Study, StudyStatus } from "@/core/studies/types";
import { Button } from "@/frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import { useToast } from "@/frontend/components/ui/use-toast";
import { useGetOrganizationDomain } from "@/frontend/hooks/organization/domain";
import {
  useStudyEmail,
  useUpdateStudyEmail,
} from "@/frontend/hooks/studies/useStudyEmail";
import useUpdateStudy from "@/frontend/hooks/studies/useUpdateStudy";
import useCopyToClipboard from "@/frontend/hooks/useCopyToClipboard";
import { useAnalytics } from "@/frontend/lib/analytics";

let rootUrl: string;
if (process.env.NEXT_PUBLIC_RESPONDENT_URL) {
  rootUrl = process.env.NEXT_PUBLIC_RESPONDENT_URL;
}

const SharePageComponent = (props: { study?: Study }) => {
  const { logEvent } = useAnalytics();
  const [value, copy] = useCopyToClipboard();
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm();
  const { data: orgDomain } = useGetOrganizationDomain();
  const { mutateAsync, isLoading, isError } = useUpdateStudy(props.study?.id);
  const [color, setColor] = useState(
    props.study?.meta?.primaryColor || "#3752dc"
  );

  const handleUpdateSharePage = async (data: { [key: string]: any }) => {
    const results = await mutateAsync({
      payload: {
        meta: {
          ...props.study?.meta,
          shareTitle: data.shareTitle,
          shareDescription: data.shareDescription,
          primaryColor: color,
          imageUrl: data.imageUrl,
        },
      },
    });

    if (results.success) {
      toast({
        description: `Study updated`,
      });
      logEvent("study_share_updated", { studyId: props.study?.id });
    } else {
      toast({
        description: `Study failed to update`,
        variant: "destructive",
      });
      logEvent("study_share_updated_failed", { studyId: props.study?.id });
    }
  };

  const handleCopy = (url: string) => {
    copy(url);
    toast({
      description: "Copied to clipboard",
    });
    logEvent("study_share_copy_url", { studyId: props.study?.id });
  };

  useEffect(() => {
    if (props.study?.meta?.primaryColor) {
      setColor(props.study?.meta?.primaryColor);
    }
  }, [props.study?.meta?.primaryColor]);

  if (!props.study) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Share the link below to get interview feedback from others.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={"mt-5"}>
              <div className="mb-1">
                <span className="font-bold">Share Link</span>
                <span className="text-xs italic ml-1">(click to copy)</span>
              </div>

              {props.study?.status === StudyStatus.ACTIVE ? (
                <Button
                  className=""
                  variant="default"
                  onClick={() =>
                    handleCopy(
                      `${orgDomain || rootUrl}/link/${props.study?.id}`
                    )
                  }
                >
                  <Link1Icon className="w-4 h-4 mr-1" />
                  {`${orgDomain || rootUrl}/link/${props.study.id}`}
                </Button>
              ) : (
                <div className="text-yellow-600 text-xs">
                  To get a share link: Go to "details" and activate the study
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <div className="grid w-full gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 p-5 rounded-xl hover:shadow">
          <h3 className="text-2xl flex items-center mb-2">
            <Share2Icon className="w-6 h-6 mr-2" />
            Study Share Page
          </h3>
          <p className="text-sm dark:text-gray-400 text-gray-600">
            Customize the page the respondents will see.
          </p>

          <p className="text-sm mt-5">Main title</p>
          <Input
            className={"w-2/4"}
            placeholder="Enter a title for the interview page"
            defaultValue={props.study?.meta?.shareTitle}
            {...register("shareTitle", { required: true, minLength: 2 })}
          />

          <p className="text-sm mt-5">Description for respondents to see</p>
          <Textarea
            className="bg-white dark:bg-black"
            id="shareDescription"
            defaultValue={props.study?.meta?.shareDescription}
            {...register("shareDescription", { required: true, minLength: 2 })}
          />

          <p className="text-sm mt-5">Banner color</p>
          <HexColorPicker color={color} onChange={setColor} />
          <HexColorInput
            prefixed
            color={color}
            onChange={setColor}
            className="w-32 bg-white dark:bg-black px-3 py-2 mt-2 rounded"
          />

          <p className="text-sm mt-5">Image or logo for study (optional)</p>
          <Input
            className={"w-2/4"}
            placeholder="URL to an image to display"
            defaultValue={props.study?.meta?.imageUrl}
            {...register("imageUrl", { minLength: 2 })}
          />

          {props.study?.meta?.imageUrl && (
            <div>
              <img
                src={props.study?.meta?.imageUrl}
                className={"w-48 h-48 object-contain"}
                alt=""
              />
            </div>
          )}

          <h3 className="text-2xl flex items-center mt-20 mb-2">
            <MailIcon className="w-6 h-6 mr-2" />
            Email Notifications
          </h3>
          <p className="text-sm dark:text-gray-400 text-gray-600">
            Enter in any email addresses you want to be notified when someone
            completes the study.
          </p>

          <EmailNotificationForm study={props.study} />

          <Button
            className="mt-10 w-20"
            variant="default"
            onClick={handleSubmit(handleUpdateSharePage)}
          >
            Save
          </Button>
        </div>
      </div>
    </>
  );
};

export default SharePageComponent;

const EmailNotificationForm = (props: { study?: Study }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const { mutateAsync, isLoading, isError } = useUpdateStudyEmail(
    props.study?.id
  );
  const { data } = useStudyEmail(props.study?.id);
  const { toast } = useToast();
  const { logEvent } = useAnalytics();

  const onAddEmail = async (payload: any) => {
    if (props.study?.id) {
      const email = payload.email;
      const existingEmails = data?.meta?.emails || [];
      const results = await mutateAsync({
        id: props.study?.id,
        emails: [...existingEmails, email],
      });

      if (results.success) {
        toast({
          description: `Email notifications updated`,
        });
        logEvent("study_add_email_notification", { studyId: props.study?.id });
      } else {
        toast({
          description: `Email notification update failed`,
          variant: "destructive",
        });
        logEvent("study_add_email_notification_failed", {
          studyId: props.study?.id,
        });
      }

      reset();
    }
  };

  const removeEmail = async (email: string) => {
    if (props.study?.id) {
      const existingEmails = data?.meta?.emails || [];
      const results = await mutateAsync({
        id: props.study?.id,
        emails: existingEmails.filter((e: string) => e !== email),
      });

      if (results.success) {
        toast({
          description: `Email notifications updated`,
        });
        logEvent("study_remove_email_notification", {
          studyId: props.study?.id,
        });
      } else {
        toast({
          description: `Email notification update failed`,
          variant: "destructive",
        });
        logEvent("study_remove_email_notification_failed", {
          studyId: props.study?.id,
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onAddEmail)}>
      <div className="flex">
        <div className="relative mr-1">
          <Input
            className="w-64"
            placeholder="Enter an email address"
            {...register("email", {
              required: true,
              minLength: 4,
              validate: (value) => {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return regex.test(value) || false;
              },
            })}
          />
          {errors.email && (
            <span className="text-xs text-red-500">
              This field is required and must be a valid email
            </span>
          )}
        </div>

        <Button type="submit" variant="secondary" size="default" className="">
          <PlusIcon className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <div>
        <ul className="mt-4 ml-2 text-xs flex flex-col space-y-1">
          {data && data.meta?.emails
            ? data.meta?.emails?.map((email: string, idx: number) => (
                <li
                  key={email + idx}
                  className="flex items-center cursor-pointer"
                  onClick={() => removeEmail(email)}
                >
                  <Cross1Icon className="h-3 w-3 mr-1" />
                  {email}
                </li>
              ))
            : null}
        </ul>
      </div>
    </form>
  );
};
