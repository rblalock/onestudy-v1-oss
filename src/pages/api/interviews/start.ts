import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { EventName, sendAnalytics } from "@/server/analytics";
import { getStudy } from "@/server/data/study";
import { startInterview } from "@/server/edgeData/interview";
import { withExceptionFilter } from "@/server/middleware/withExceptionFilter";
import { withMethodsGuard } from "@/server/middleware/withMethodGuard";
import { withPipe } from "@/server/middleware/withPipe";
import {
  throwBadRequestException,
  throwForbiddenException,
  throwInternalServerErrorException,
  throwNotFoundException,
} from "@/server/utils/http-exceptions";
import logger from "@/server/utils/logger";
import { ClerkRequest } from "@/server/utils/types";

const Body = z.object({
  studyId: z.string().nonempty(),
  userMetaData: z.record(z.any()).optional(),
});

const SUPPORTED_HTTP_METHODS: HttpMethod[] = ["POST"];

export default function startInterviewApi(
  req: ClerkRequest,
  res: NextApiResponse,
) {
  const handler = withPipe(
    withMethodsGuard(SUPPORTED_HTTP_METHODS),
    startInterviewHandler,
  );

  return withExceptionFilter(req, res)(handler);
}

const startInterviewHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const body = await Body.safeParse(req.body);

    if (!body.success) {
      return throwBadRequestException("Invalid request");
    }

    const study = await getStudy(body.data.studyId);
    if (!study) {
      return throwNotFoundException(`Study ${body.data.studyId} not found`);
    }

    logger.info(
      {
        studyId: body.data.studyId,
        userMetaData: body.data.userMetaData,
      },
      `Starting interview`,
    );

    const interview = await startInterview(
      body.data.studyId,
      study as any,
      body.data.userMetaData,
    );

    sendAnalytics(EventName.InterviewStarted, {
      studyId: body.data.studyId,
      interviewId: interview.id,
      organizationId: study.organizationId,
    });

    logger.info({ id: interview.id }, `Started interview`);

    return res.send({
      success: true,
      id: interview.id,
    });
  } catch (e: any) {
    return throwInternalServerErrorException(e.message);
  }
};
