/**
 * @name HttpStatusCode
 * @description HTTP status codes
 */
export enum HttpStatusCode {
	Ok = 200,
	MovedPermanently = 301,
	MovedTemporarily = 302,
	SeeOther = 303,
	BadRequest = 400,
	Unauthorized = 401,
	Forbidden = 403,
	NotFound = 404,
	MethodNotAllowed = 405,
	InternalServerError = 500,
}

export type HttpMethod = `GET` | `POST` | `PUT` | 'PATCH' | 'DELETE' | 'HEAD';
