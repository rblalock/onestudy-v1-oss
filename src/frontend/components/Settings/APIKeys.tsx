import { XCircleIcon } from "@heroicons/react/24/outline";
import { Link1Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { Input } from "@/frontend/components/ui/input";
import { useToast } from "@/frontend/components/ui/use-toast";
import useCreateApiKey from "@/frontend/hooks/apiKeys/useCreateApiKey";
import useDeleteApiKey from "@/frontend/hooks/apiKeys/useDeleteApiKey";
import useListApiKeys from "@/frontend/hooks/apiKeys/useListApiKeys";
import useDeleteGroup from "@/frontend/hooks/groups/useDeleteGroup";
import useCopyToClipboard from "@/frontend/hooks/useCopyToClipboard";
import { useAnalytics } from "@/frontend/lib/analytics";

const ApiKeysPage = () => {
  const { register, handleSubmit, reset } = useForm();
  const { logEvent } = useAnalytics();
  const [value, copy] = useCopyToClipboard();
  const { toast } = useToast();
  const { data, isLoading, isError } = useListApiKeys();
  const { mutateAsync } = useCreateApiKey();
  const { mutateAsync: deleteApiKey } = useDeleteApiKey();
  const [apiKey, setApiKey] = useState<string>();

  const handleCreateApiKey = async (data: { [key: string]: any }) => {
    const results = await mutateAsync({
      name: data.name,
    });
    if (results.success) {
      setApiKey(results.data.key);
    } else {
      toast({
        description: `API Key could not be created.`,
        variant: "destructive",
      });
    }

    reset({ name: "" });
  };

  const handleDeleteApiKey = async (id: string) => {
    const results = await deleteApiKey({ id });
    if (results.success) {
      toast({
        description: `API Key deleted`,
      });
    } else {
      toast({
        description: `API Key could not be deleted.`,
        variant: "destructive",
      });
    }
  };

  const handleCopy = (val: string) => {
    copy(val);
    toast({
      description: "Copied to clipboard",
    });
    logEvent("copy_api_key");
  };

  return (
    <div>
      <div className="">
        <div className="mb-10 w-full md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Create an API key</CardTitle>
              <CardDescription>
                Create an API key to interact with the Shopmonkey Research API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                {...register("name", { required: true, minLength: 2 })}
                id="name"
                placeholder="Give it a friendly name"
                className="mb-2"
              />
              <Button className="" onClick={handleSubmit(handleCreateApiKey)}>
                Create API Key
              </Button>

              {apiKey ? (
                <div className={"mt-5 bg-blue-900 p-3 rounded-xl text-white"}>
                  <div className="mb-1">
                    <span className="font-bold">Here's your new API Key</span>
                    <span className="text-xs italic ml-1">(click to copy)</span>
                  </div>

                  <div>
                    <span className="text-xs ml-1">
                      Only will be visible this one time!
                    </span>
                  </div>

                  <Button
                    className=" border-b rounded-none"
                    variant="ghost"
                    onClick={() => handleCopy(apiKey)}
                  >
                    <Link1Icon className="w-4 h-4 mr-3" />
                    <pre className="text-sm">{apiKey}</pre>
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-1/2 mx-5">
          <h2 className="text-2xl mb-3">Existing API Keys</h2>

          {isLoading && <div>Loading...</div>}
          {isError && <div>Whoops!</div>}

          {data && data.length > 0 ? (
            data.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between py-2 space-x-2 bordr border-b dark:border-gray-800 space-y-2"
              >
                <div>
                  <span>{key.name}</span>
                  <br />
                  <pre className="text-sm">{key.start}...</pre>
                </div>

                <button onClick={() => handleDeleteApiKey(key.id)}>
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            ))
          ) : (
            <div>No API keys have been created.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeysPage;
