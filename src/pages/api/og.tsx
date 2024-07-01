import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
	runtime: 'edge',
};

export default async function handler(request: NextRequest) {
	try {
		const logoData = await fetch(new URL('../../../public/assets/icons/logo_white.png', import.meta.url)).then(
			(res) => res.arrayBuffer(),
		);
		const { searchParams } = new URL(request.url);

		// ?title=<title>
		const hasTitle = searchParams.has('title');
		const title = hasTitle
			? searchParams.get('title')?.slice(0, 100)
			: '';

		return new ImageResponse(
			(
				<div
					style={{
						backgroundColor: '#111',
						backgroundSize: '150px 150px',
						height: '100%',
						width: '100%',
						display: 'flex',
						textAlign: 'center',
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'column',
						flexWrap: 'nowrap',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							justifyItems: 'center',
						}}
					>
						<img
							// @ts-ignore
							src={logoData}
							style={{ margin: '0 30px' }}
							width={400}
						/>
					</div>
					<div
						style={{
							fontSize: 40,
							fontStyle: 'normal',
							letterSpacing: '-0.025em',
							color: 'white',
							marginTop: 10,
							padding: '0 120px',
							lineHeight: 1.4,
							whiteSpace: 'pre-wrap',
						}}
					>
						{title}
					</div>
				</div>
			),
			{
				width: 1200,
				height: 630,
			},
		);
	} catch (e: any) {
		return new Response(`Failed to generate the image`, {
			status: 500,
		});
	}
}