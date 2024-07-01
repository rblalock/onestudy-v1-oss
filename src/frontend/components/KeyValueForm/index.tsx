import { MinusIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { Label } from '@/frontend/components/ui/label';

const generateKey = () => {
	let timestamp = Date.now();
	// Convert timestamp to base36 (a-z0-9)
	return `key_${timestamp.toString(36)}`;
}

export type KeyValueFormField = {
	key: string;
	type: string;
	label: string;
	required?: boolean;
}

const KeyValueForm = (props: {
	onDataChange?: (data: KeyValueFormField[]) => void;
	onSave?: (payload: KeyValueFormField[]) => void;
	data?: KeyValueFormField[];
}) => {
	const [hasChanged, setHasChanged] = useState(false);
	const [pairs, setPairs] = useState<KeyValueFormField[]>(props.data || []);
	// [
	// 	{ key: generateKey(), type: 'email', label: 'Contact Email', required: false }
	// ]

	useEffect(() => {
		props.onDataChange?.(pairs);
	}, [pairs, props, props.onDataChange]);

	const handleChange = (idx: number, e: any) => {
		const { name, value } = e.target;

		const newPairs = [...pairs];
		// @ts-ignore
		newPairs[idx][name] = value;
		if (name === 'required') {
			// @ts-ignore
			newPairs[idx][name] = e.target.checked;
		} else {
			// @ts-ignore
			newPairs[idx][name] = value;
		}
		setPairs(newPairs);
		setHasChanged(true);
	}

	const handleAddPair = () => {
		setPairs([...pairs, { key: generateKey(), type: '', label: '', required: false }]);
	}

	const handleRemovePair = (idx: number) => {
		setPairs(pairs.filter((s, _idx) => _idx !== idx));
		setHasChanged(true);
	}

	const handleSave = () => {
		if (props.onSave) {
			props.onSave(pairs);
			setHasChanged(false);
		}
	};

	return (
		<div>
			{pairs.map((pair, idx) => (
				<div key={idx} className="flex items-center mb-2">
					<div className="w-1/4 mr-2">
						<select
							name="type"
							value={pair.type}
							onChange={e => handleChange(idx, e)}
							className="pl-3 active-within:ring-2 relative flex h-10 w-full items-center
								rounded-md border border-gray-200 bg-white font-medium text-gray-800
								shadow-sm ring-primary-200 ring-offset-1 transition-all focus-within:ring-2
								hover:border-gray-300 hover:bg-gray-50 
								dark:border-slate-800 dark:bg-black
								dark:text-gray-200 dark:focus-within:ring-primary-500/70 dark:focus-within:ring-offset-black-500
								dark:hover:border-black-100 dark:focus:bg-black-400 lg:text-sm"
						>
							<option value="">Select type</option>
							<option value="email">Email</option>
							<option value="text">Text</option>
						</select>
					</div>

					<Input
						className={'w-2/4'}
						placeholder={'Enter a label'}
						value={pair.label}
						name="label"
						onChange={e => handleChange(idx, e)}
					/>

					<Label className={'flex space-x-2 ml-2'}>
						<input
							type={'checkbox'}
							className={'Toggle'}
							name="required"
							checked={pair.required}
							onChange={e => handleChange(idx, e)}
						/>
						<span>Required</span>
					</Label>

					<Button className="h-5 w-5 ml-3" size="icon" onClick={() => handleRemovePair(idx)}>
						<MinusIcon className={'h-5'} />
					</Button>
				</div>
			))}

			<Button
				variant="secondary"
				size="sm"
				onClick={handleAddPair}
			>
				Add a field
			</Button>

			{hasChanged ? (
				<Button
					onClick={handleSave}
					size="sm"
					className="ml-2 animate-in fade-in zoom-in-60"
				>
					Save
				</Button>
			) : null}
		</div>
	);
}

export default KeyValueForm;
