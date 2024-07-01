import { slugify } from "inngest";

import { EventClient } from "../client";

export default EventClient.createFunction(
	{ name: "Hello world", id: slugify("Hello world") },
	{ event: "internal/helloworld" },
	async ({ event }) => {
		return "It worked!";
	}
);
