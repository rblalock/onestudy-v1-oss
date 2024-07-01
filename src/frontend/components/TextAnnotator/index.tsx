import { DialogClose } from "@radix-ui/react-dialog";
import { EyeNoneIcon, MagicWandIcon, MinusCircledIcon, PlusIcon, StopIcon } from "@radix-ui/react-icons";
import { Edit, HighlighterIcon } from "lucide-react";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { Annotation } from "@/core/types";
import useCreateInterviewTags from "@/frontend/hooks/tags/useCreateInterviewTags";
import useDeleteTag from "@/frontend/hooks/tags/useDeleteTag";
import useTagsList from "@/frontend/hooks/tags/useTagsList";
import { useAnalytics } from "@/frontend/lib/analytics";

import TagSelector from "../Fields/TagSelector";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "../ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { ToastAction } from "../ui/toast";
import { toast } from "../ui/use-toast";
import { TextAnnotateBlend } from "./utils";

export interface AnnotatorContextProps {
	openModal: boolean;
	setOpenModal: (value: boolean) => void;
	getTag: () => { tag: string; color: string };
	isEditing: boolean;
	showAnnotations: boolean;
	onAnnotationUpdate: (id: number, annotations: Annotation[]) => void;
}

export const AnnotatorContext = createContext<AnnotatorContextProps | undefined>(undefined);

const defaultTag = {
	tag: 'General',
	color: '#eee',
};

export const AnnotatorWrapper = (props: {
	children: React.ReactElement[];
	studyId?: string;
	interviewId?: string;
	onTagCreation: (payload: {
		tag: string;
		color: string;
	}) => Promise<void>;
	onAnnotationUpdate: (id: number, annotations: Annotation[]) => void;
}) => {
	const { data, isLoading, isError, refetch } = useTagsList();
	const { mutateAsync: mutateDeleteTag } = useDeleteTag();
	const { mutateAsync: generateTags } = useCreateInterviewTags();

	const { logEvent } = useAnalytics();
	const [isEditing, setIsEditing] = useState(false);
	const [showAnnotations, setShowAnnotations] = useState(true);
	const [openModal, setOpenModal] = useState(false);
	const [selectedTag, setSelectedTag] = useState<string>();
	const [selectedTagId, setSelectedTagId] = useState<string>();
	const [selectedColor, setSelectedColor] = useState<string>();
	const [openCommands, setOpenCommands] = useState(false)

	const getTag = useCallback(() => {
		return {
			tag: selectedTag || defaultTag.tag,
			color: selectedColor || defaultTag.color,
		};
	}, [selectedTag, selectedColor]);
	
	const onTagCreation = async (payload: {
		tag: string;
		color: string;
	}) => {
		await props.onTagCreation(payload);

		refetch();

		setSelectedTag(payload.tag);
		setSelectedColor(payload.color);
		setOpenModal(false);
	};

	const handleSelectTag = (value: string) => {
		const tag = data?.find((tag) => tag.tagName === value);
		if (tag) {
			setSelectedTagId(tag.id);
			setSelectedTag(tag.tagName);
			setSelectedColor(tag.color);
		}
	};

	const handleDeleteTag = async (tagId?: string) => {
		if (tagId) {
			const results = await mutateDeleteTag({
				id: tagId
			});

			if (results.success) {
				toast({
					description: `Tag deleted`,
				});

				setSelectedTag(defaultTag.tag);
				setSelectedColor(defaultTag.color);
			} else {
				toast({
					description: `Tag could not be deleted.`,
					variant: "destructive"
				})
			}
		}
	};

	const enableAnnotations = () => {
		setShowAnnotations(!showAnnotations);
	}

	const enableEditing = () => {
		const val = !isEditing;
		setIsEditing(val);

		if (val) {
			setShowAnnotations(true);
			logEvent('interview_start_editing', { studyId: props.studyId });
		}
	}

	const handleRegenerateTags = async () => {
		if (!props.interviewId || !props.studyId) return;

		toast({
			title: `Regenerating tags`,
			description: `This might take a few seconds...`,
			action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
			duration: 15000,
		});

		const res = await generateTags({
			interviewId: props.interviewId,
			studyId: props.studyId,
		});

		if (res.success) {
			toast({
				description: `Tags regenerated`,
			});
			window.location.reload();
		} else {
			toast({
				description: `Tags failed to regenerate. Try again later.`,
				variant: "destructive"
			})
		}
	};

	const handleCommandTagSelection = (tag: string) => {
		handleSelectTag(tag);
		setOpenCommands(false);
	};

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				setOpenCommands((open) => !open)
			}
		}
		document.addEventListener("keydown", down)
		return () => document.removeEventListener("keydown", down);
	}, []);

	const metaKey = useMemo(() => {
		const isMac = window.navigator.userAgent.includes('Mac');
		return isMac ? '⌘' : 'Ctrl';
	}, []);

	return (
		<>
			<AnnotatorContext.Provider value={{ 
				openModal, 
				setOpenModal,
				getTag,
				isEditing,
				showAnnotations,
				onAnnotationUpdate: props.onAnnotationUpdate,
			}}>
				<div className="dark:bg-slate-900 shadow-lg rounded-lg dark:text-slate-100 mb-5">
					<div className="flex flex-col items-center lg:flex-row px-3 py-3">
						<Button
							onClick={enableEditing}
							className="mr-3"
							variant={isEditing ? 'destructive' : 'default'}
						>
							{isEditing ? (
								<>
									<StopIcon className={`h-4 w-4 mr-1 ${isEditing ? 'dark:text-red-500' : ''}`} />
									Stop annotating
								</>
							) : (
								<>
									<Edit className = "h-4 w-4 mr-1" />
									Start annotating
								</>
							)}
						</Button>

						{isEditing ? (
							<>
								<div className="w-64 p-3 rounded-lg text-left text-xs bg-slate-200 dark:bg-black dark:text-white" onClick={() => setOpenCommands(!openCommands)}>
									{(selectedTag) ? (
										<div>
											<span
												className={`animate-fade px-1 py-0.2 rounded-full mr-2`}
												style={{
													backgroundColor: selectedColor || defaultTag.color,
												}}
											/>
											<span className="">{selectedTag}</span>
										</div>
									) : (
										<div className="flex items-center cursor-pointer">
											<span className="">Select a tag for highlighting</span>
											<span className="flex-1" />
											<span className="text-[10px] text-slate-400 rounded-lg bg-slate-800 py-1 px-2 font-bold">{metaKey}+K</span>
										</div>
									)}
								</div>

								<div className="relative ml-2">
									<Button
										onClick={() => setOpenModal(true)}
										size="sm"
										variant="ghost"
										className="text-xs"
									>
										<PlusIcon className="h-4 w-4 mr-1" />
										Add a tag
									</Button>

									{selectedTag && selectedTag !== defaultTag.tag ? (
										<Button
											onClick={() => handleDeleteTag(data?.find((tag) => tag.tagName === selectedTag)?.id)}
											size="sm"
											variant="ghost"
											className="text-xs"
										>
											<MinusCircledIcon className="h-4 w-4 mr-1" />
											Delete tag
										</Button>
									) : null}
								</div>

								<div className="flex-1" />

								<div className="relative ml-2">
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												size="sm"
												variant="ghost"
												className="text-xs"
											>
												<MagicWandIcon className="h-4 w-4 mr-2" />
												Regenerate tags
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Auto tag this transcript?</AlertDialogTitle>
												<AlertDialogDescription>
													We will attempt to re-tag this transcript based on the content. 
													You will lose any highlights you've currently applied.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction onClick={handleRegenerateTags}>Continue</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</>
						) : (
							<Button
								onClick={enableAnnotations}
								size="sm"
								variant="ghost"
								className="text-xs"
							>
								{showAnnotations ? (
									<>
										<EyeNoneIcon className="h-4 w-4 mr-1" />
										Hide annotations
									</>
								) : (
									<>
										<HighlighterIcon className="h-4 w-4 mr-1" />
										Show annotations
									</>
								)}
							</Button>
						)}
					</div>
				</div>

				{props.children}
			</AnnotatorContext.Provider>

			<Dialog open={openModal} onOpenChange={setOpenModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create a tag</DialogTitle>
						<DialogDescription>
							Create a tag you would like to use to highlight things with.
						</DialogDescription>
					</DialogHeader>

					<div className="relative mt-5">
						<TagSelector onTagSelection={onTagCreation} />
					</div>

					<div className="flex justify-end items-center">
						<DialogClose asChild>
							<Button type="button" variant="ghost">
								Cancel
							</Button>
						</DialogClose>
					</div>
				</DialogContent>
			</Dialog>

			<CommandDialog open={openCommands} onOpenChange={setOpenCommands}>
				<CommandInput placeholder="Type a tag or search for it..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>

					<CommandGroup heading="Operations">
						<CommandItem onSelect={() => {
							setOpenCommands(false);
							setOpenModal(true);
						}}>
							<PlusIcon className="h-4 w-4 mr-2" />
							Create a tag
						</CommandItem>
					</CommandGroup>

					<CommandSeparator />

					<CommandGroup heading="Tags">
						{(!isLoading && data) ? data.map((tag) => (
							<CommandItem onSelect={() => handleCommandTagSelection(tag.tagName)} key={tag.id}>
								<div className="">
									<span
										className={`animate-fade px-1 py-0.2 rounded-full mr-2`}
										style={{
											backgroundColor: tag.color,
										}}
									/>
									{tag.tagName}
								</div>
							</CommandItem>
						)) : (
							<div className="p-2 text-xs">Loading...</div>
						)}
					</CommandGroup>

				</CommandList>
			</CommandDialog>
		</>
	);
};

export const Annotator = (props: {
	id: number;
	content: string;
	annotations?: Annotation[];
}) => {
	const annotatorContext = useContext(AnnotatorContext);
	if (!annotatorContext) {
		throw new Error('Annotator must be used within AnnotatorWrapper');
	}

	const [annotations, setAnnotations] = useState(props.annotations);

	const handleAnnotationUpdate = (annotations: Annotation[]) => {
		setAnnotations(annotations);
		annotatorContext.onAnnotationUpdate(props.id, annotations);
	}

	const getSpan = (span: any) => {
		const obj = annotatorContext.getTag();

		return {
			...span,
			tag: obj.tag || defaultTag.tag,
			color: obj.color || defaultTag.color,
		};
	}

	return (
		<>
			{annotatorContext.showAnnotations ? (
				<TextAnnotateBlend
					content={props.content}
					onChange={handleAnnotationUpdate}
					value={annotations || []}
					getSpan={getSpan}
					enabled={annotatorContext.isEditing}
				/>
			) : (
				<>{props.content}</>
			)}
		</>
	)
};
