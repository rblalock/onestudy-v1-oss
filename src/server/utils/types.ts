import { ServerGetToken } from '@clerk/types'
import { NextApiRequest } from "next"


export interface ClerkRequest extends NextApiRequest {
	auth: {
		userId?: string | null
		sessionId?: string | null
		orgId?: string | null
		orgRole?: string | null
		getToken: ServerGetToken
	}
}