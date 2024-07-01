declare module '@mdx-js/react';
declare module 'remark-mdx';

export {};

declare global {
	type StringObject = Record<string, string>;
	type NumberObject = Record<string, number>;
	type UnknownObject = Record<string, unknown>;
	type BooleanObject = Record<string, boolean>;
	type UnixTimestamp = number;

	type WithId<T> = T & {
		id: string;
	};

	type Truthy<T> = false extends T
		? never
		: 0 extends T
		? never
		: '' extends T
		? never
		: null extends T
		? never
		: undefined extends T
		? never
		: T;

	type Falsy = false | 0 | '' | null | undefined;
	type Maybe<T> = T | undefined;
	type EmptyCallback = () => void;
	type HttpMethod = `GET` | `POST` | `PUT` | 'PATCH' | 'DELETE' | 'HEAD';
}

// declare module 'next' {

// }

// declare module 'react' {
// 	type FCC<Props = Record<string, unknown>> = React.FC<
// 		React.PropsWithChildren<Props>
// 	>;
// }
