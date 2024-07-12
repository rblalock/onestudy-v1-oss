import { NextApiRequest, NextApiResponse } from 'next';
import { Parser } from 'json2csv';
import { getInterviews } from '@/server/data/interview/public';
import { withApiKey } from '@/server/middleware/withApiKey';
import { withCors } from '@/server/middleware/withCors';
import { withExceptionFilter } from '@/server/middleware/withExceptionFilter';
import { withMethodsGuard } from '@/server/middleware/withMethodGuard';
import { withPipe } from '@/server/middleware/withPipe';
import { HttpMethod } from '@/server/utils/http';
import { throwBadRequestException } from '@/server/utils/http-exceptions';

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ['GET'];

export default function exportInterviewsApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const handler = withPipe(
    withMethodsGuard(SUPPORTED_HTTP_METHODS),
    withCors(),
    exportInterviewsHandler
  );

  return withExceptionFilter(req, res)(handler);
}

const exportInterviewsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { query } = req;

  const studyId = query.studyId as string | undefined;
  if (!studyId) {
    return throwBadRequestException('Missing studyId parameter');
  }

  const apiKeyPayload = await withApiKey()(req, res);

  const orgId = apiKeyPayload?.meta?.organizationId as string;

  if (orgId) {
    try {
      const interviews = await getInterviews(studyId, orgId);

      const fields = ['id', 'status', 'summaryTitle', 'createdAt', 'userMetaData'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(interviews);

      res.setHeader('Content-Disposition', 'attachment; filename=interviews.csv');
      res.setHeader('Content-Type', 'text/csv');
      res.status(200).send(csv);
    } catch (error) {
      res.status(500).json({ error: 'Failed to export interviews' });
    }
  } else {
    return res.status(401).send({
      success: false,
      message: 'Unauthorized - missing organization'
    });
  }
};
