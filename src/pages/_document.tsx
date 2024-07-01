import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				{/* eslint-disable-next-line @next/next/no-sync-scripts */}
				<script type="text/javascript" src="https://app.getterms.io/cookie-consent/embed/00ca2ee5-81cd-4b53-81c5-443fab28dfa2"></script>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}