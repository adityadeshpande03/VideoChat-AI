prompt = """Analyze the following video transcript content and provide a comprehensive response to the user's query.

Context: The transcript contains segments from a video. Your task is to analyze these segments and provide a clear, organized response.

Query: {query}
Transcript Content: {text}

Please structure your response in this format:

Main Points
[Key points relevant to the query in bullet form]

Focus on being:
- Relevant to the query
- Clear and well-organized
- Technically accurate
- Supported by the transcript content

Avoid generic statements and focus on specific information from the transcript."""