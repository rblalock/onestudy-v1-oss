import { NextApiRequest, NextApiResponse } from 'next'

const healthCheck = (req: NextApiRequest, res: NextApiResponse) => {
	res.status(200).json({ status: 'ok' })
};

export default healthCheck;