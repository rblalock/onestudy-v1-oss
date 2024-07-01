export enum EventName {
  InterviewCompleted = "interview_completed",
  InterviewStarted = "interview_started",
  InterviewSummarized = "interview_summarized",
  InterviewTagged = "interview_tagged",
  ConversationHit = "conversation_hit",
  StudySummarized = "study_summarized",
  VectorDocumentEmbedding = "vector_document_embedding",
  RAGSearch = "rag_search",
  CreateStudyInsight = "create_study_insight",
  UpdateStudyInsight = "update_study_insight",
  CreateStudySummaryInsight = "create_study_summary_insight",
}

const tinyBirdApiKey = process.env.TINYBIRD_API_KEY;

if (!tinyBirdApiKey) {
  console.error("Missing TinyBird API key - analytics will not be sent");
}

const sentToTinyBird = (
  eventName: EventName,
  payload: { [key: string]: any }
) => {
  return fetch(`https://api.us-east.tinybird.co/v0/events?name=${eventName}`, {
    method: "POST",
    body: JSON.stringify({
      ...payload,
    }),
    headers: { Authorization: `Bearer ${tinyBirdApiKey}` },
  }).then((res) => res.json());
};

export const sendAnalytics = (
  eventName: EventName,
  payload: { [key: string]: any }
) => {
  if (tinyBirdApiKey) {
    sentToTinyBird(eventName, payload);
  }
};
