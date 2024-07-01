import { oembed } from "@loomhq/loom-embed";
import React, { useEffect, useState } from 'react';

import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';

import { toast } from '../ui/use-toast';

const EmbedField = (props: {
	onDataChange?: (data: string[]) => void;
	onSave?: (payload: string[]) => void;
	data?: string[];
}) => {
	const [hasChanged, setHasChanged] = useState(false);
	const [embedUrls, setEmbedUrls] = useState<string[]>(props.data || []);
	const [embedHtml, setEmbedHtml] = useState<string>();

	useEffect(() => {
		props.onDataChange?.(embedUrls);
	}, [embedUrls, props, props.onDataChange]);

	useEffect(() => {
		embedLoomVideo();
	}, []);

	const handleChange = (val: string) => {
		setEmbedUrls([val.trim()]);
		setHasChanged(true);
	}

	const handleSave = () => {
		if (props.onSave) {
			const value = embedUrls[0];
			const loomLinkRegex = /^https:\/\/www\.loom\.com\/share\/[a-z0-9]+(\?[a-z0-9=&-]*)?$/i;

			if (!value) {
				setEmbedUrls([]);
				setEmbedHtml(undefined);
				props.onSave([]);
				return;
			}

			if (loomLinkRegex.test(value)) {
				props.onSave(embedUrls);
				embedLoomVideo();
			} else {
				setEmbedUrls([]);
				setEmbedHtml(undefined);
				toast({
					description: `Only Loom links are supported at this time.`,
					variant: "destructive"
				});
			}

			setHasChanged(false);
		}
	};

	const embedLoomVideo = async () => {
		const videoUrl = embedUrls?.[0];
		if (videoUrl) {
			const { html } = await oembed(videoUrl, { width: 640, height: 360 });
			setEmbedHtml(html);
		} else {
			setEmbedHtml(undefined);
		}
	}

	return (
		<div>
			<div className="flex items-center mb-2">
				<Input
					className={'w-full'}
					placeholder={'Enter a URL'}
					value={embedUrls[0] || ''}
					name="label"
					onChange={e => handleChange(e.target.value)}
				/>
			</div>

			{hasChanged ? (
				<Button
					onClick={handleSave}
					size="sm"
					className="ml-2 animate-in fade-in zoom-in-60"
				>
					Save
				</Button>
			) : null}

			{embedHtml ? (
				<div className="mt-4">
					<div dangerouslySetInnerHTML={{ __html: embedHtml }} />
				</div>
			) : null}
		</div>
	);
}

export default EmbedField;
