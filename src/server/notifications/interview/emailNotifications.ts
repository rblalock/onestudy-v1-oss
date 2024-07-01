import { sendEmail } from "../email";

if (!process.env.MAIL_TRANSACTIONAL_ID) {
  console.error("MAIL_TRANSACTIONAL_ID is not set");
}
export const transactionalId = process.env.MAIL_TRANSACTIONAL_ID;

export const sendInterviewEmailNotifications = async (
  interviewId: string,
  studyId: string,
  studyName: string,
  email: string,
  userMetadata?: { [key: string]: any } | null
) => {
  let userMetaDataString = "";
  if (userMetadata && Object.keys(userMetadata).length > 0) {
    Object.keys(userMetadata).forEach((key) => {
      if (key === "transcriptOptIn") {
        return;
      }
      userMetaDataString += `${userMetadata[key]}\n<br />`;
    });
  }

  return sendEmail({
    transactionalId,
    email: email,
    dataVariables: {
      interviewLink: `https://${process.env.NEXT_PUBLIC_DOMAIN_URL}/studies/${studyId}/interview/${interviewId}`,
      studyName: studyName,
      userMetaData: userMetaDataString,
    },
  });
};
