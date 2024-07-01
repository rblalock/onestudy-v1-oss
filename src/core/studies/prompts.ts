
export const studySummaryPrompt = () => {
	return (`
			Please provide a summary of the entire study. Divide it into the following sections: 
			- 1-2 sentence description of the research outcome 
			- description of the research goal  
			- number and type of participants  
			- an assessment of how well the goal was achieved and if further research is recommended. 
			
			Keep the sections brief and refrain from using long, complex words.  
			Use the following section headers: outcome, research goal, respondents, assessment

			Generate the summary in markdown syntax.  The interviews are below:
	`)
}

export const studyThemePrompt = () => {
	return `
		Provide a list the most common themes found in the interviews that are related to the 
		research goal. Each theme should include 1-5 word title, as well as a brief 
		synthesis explaining the connection to the research outcome.
		
		Generate the summary in markdown syntax.
	`;
};

export const studyInsightsPrompt = () => {
	return `
		Provide a list of unusual, surprising or otherwise unexpected themes. Each theme 
		should include 1-5 word title, as well as a brief explanation of why this theme is 
		unusual or unexpected.

		Generate the insights in markdown syntax.
	`;
};

export const studyThematicQuotesPrompt = () => {
	return `
		Please provide a list of quotes that are grouped into the most common themes found 
		in the interviews that are related to the research goal.

		Generate the quotes in markdown syntax.
	`;
};

export const studyUnusualQuotesPrompt = () => {
	return `
		Provide a list of quotes that are unusual or unexpected, given the research goal. 
		Include a brief explanation of why each quote was selected for this.

		Generate the quotes in markdown syntax.
	`;
};
