import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/frontend/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Input } from "@/frontend/components/ui/input"
import { useToast } from "@/frontend/components/ui/use-toast";
import {useGetOrganizationDomain, useUpdateOrganizationDomain} from "@/frontend/hooks/organization/domain";
import { useAnalytics } from "@/frontend/lib/analytics";

const DomainPage = () => {
	const { register, handleSubmit, reset, formState: { errors } } = useForm();
	const { logEvent } = useAnalytics();
	const { toast } = useToast()
	const { data, isLoading, isError } = useGetOrganizationDomain();
	const { mutateAsync: updateDomain } = useUpdateOrganizationDomain();
	const [domainSetting, setDomainSetting] = useState<string>();

	useEffect(() => {
		if (data) {
			setDomainSetting(data);
		}
	}, [data]);

	const handleRegisterCustomDomain = async (data: { [key: string]: any }) => {
		const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
			'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
			'(\\:\\d+)?'+ // port
			'(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
			'(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
			'(\\#[-a-z\\d_]*)?$','i'); // fragment locator

		if (!urlPattern.test(data.url)) {
			toast({
				description: `Invalid URL.`,
				variant: "destructive"
			})
			return;
		}

		const domain = data.url;
		const results = await updateDomain({
			domain
		})
		if (!results.success) {
			toast({
				description: `Domain could not be set`,
				variant: "destructive"
			})
		} else {
			setDomainSetting(domain);
			logEvent('updated_custom_domain', { domain });
			toast({
				description: `Domain updated`
			})
		}
	};

	const removeCustomDomain = async () => {
		const results = await updateDomain({
			domain: undefined
		})
		if (!results.success) {
			toast({
				description: `Domain could not be updated`,
				variant: "destructive"
			})
		} else {
			setDomainSetting(undefined);
			logEvent('removed_custom_domain', { data });
			toast({
				description: `Domain updated`
			})
		}
	};

	return (
		<div>
			<div className="">
				<div className="mb-10 w-full md:w-2/3">
					<h2 className="text-2xl mb-3">Custom domain handling</h2>
					<p className="mb-8 leading-snug text-sm">
						This determines the domain used when respondents or customers interact with your studies. 
						<br />i.e. The share link you get in a study, will use this domain.
						<br /><br /><strong>NOTE:</strong> Only do this if you know what you are doing. 
						<br />For example, 
						we have a sample app <a className="text-blue-500 underline" href="https://github.com/onestudy-ai/respondent-app">here</a> that you could 
						fork and host yourself.
					</p>

					<Card>
						<CardHeader>
							<CardTitle>Custom domain</CardTitle>
							<CardDescription>
								Use a custom domain for your study share links.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Input
								{...register('url', {
									required: true,
									minLength: 3,
								})}
								defaultValue={domainSetting}
								id="url"
								type="url"
								placeholder="e.g. https://example.com"
								className="mb-2"
							/>

							<div className="flex justify-between">
								<Button
									className=""
									onClick={handleSubmit(handleRegisterCustomDomain)}
								>
									Register domain
								</Button>

								{data ? (
									<Button
										variant={"destructive"}
										onClick={removeCustomDomain}
									>
										Delete
									</Button>
								) : null}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default DomainPage;

