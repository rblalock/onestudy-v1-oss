if (!process.env.MAIL_KEY) {
  console.error("MAIL_KEY environment variable is not set.");
}

export const urlEndpoint = "https://app.loops.so/api/v1/transactional";

export const sendEmail = async (payload: { [key: string]: any }) => {
  const response = await fetch(urlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MAIL_KEY}`,
    },
    body: JSON.stringify({
      ...payload,
    }),
  });
  const data = await response.json();

  return data;
};
