
export const interviewSummaryPrompt = () => {
	return (`
		You just completed an interview study.  If the interview was useful, summarize so stakeholders and research assistants 
		can understand what happened. Only write up one or two sentences and based 
		on what the input from the user was. Be quick and short and to the point making sure the most
		After that, if there are any common themes, or other insights, add a bulleted list, only if applicable. 
		The bullets should be short and concise.
		If there is an important quote or interesting quote, add it to the bottom of the summary in quotes. 
		Generate the summary in markdown syntax.  
		The notes are below:
	`)
}

export const interviewSentimentPrompt = () => {
	return (`
		You just completed an interview study. You need to do a sentiment analysis on the responses.
		Provide an overall sentiment analysis output for transcript, in one word.
	`)
}

export const interviewSummaryTitlePrompt = () => {
	return (`
		You just completed an interview study. Given the summary, generate a very short title which 
		introduces the interview.  The title will be used in a table or csv so keep it short.
		If there is a quote, use that as the title if it makes sense.
	`)
}

export const interviewTagPrompt = (availableTags?: string[], studyInfo?: string) => {
	return (`
You are a qualitative researcher who is responsible for reviewing interviews and 
tagging them with keywords to highlight insights. 
Below is a customer interview transcript.

Go through each part and tag keywords.  

Default tags include: Sentiment, Habit, Action, Question.

The user defined available tags are:
${availableTags ? availableTags.join(', ') : ''}.

The overall purpose of the study is: ${studyInfo ? studyInfo : ''}.

---

You can add additional tags if the default tags are not as precise or accurate for a 
particular statement from a respondent. These new tags should be intuitive and relevant to the context of the 
conversation. They should also only be one word.

The output of the tags should be JSON.  The format of each annotation/tag should follow this type structure:
New tags should simple just be used like any other tag, no indication or special handling is needed.

export type Annotation = {
	text: string;
	tag: string;
};

so the output should look like this:
{
	"annotations": [{
		text: 'the text that was tagged',
		tag: 'Tag name here'
	}]
}
	`)
};
