
try {
    const { jobTitle, competencies } = await req.json()

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
        throw new Error('Missing OPENAI_API_KEY')
    }

    const prompt = `
      You are an expert HR consultant. Generate interview questions for the following competencies for the role of ${jobTitle}.
      
      Competencies:
      ${JSON.stringify(competencies)}

      For EACH competency, generate 3 questions:
      1. One "Behavioral" question (asking for past experience).
      2. One "Competency" question (testing knowledge/skill).
      3. One "Deceiving" question (a trick question to test if the candidate can identify a false premise or handle a tricky situation).

      Return a JSON array of objects with the following structure:
      {
        "competencyName": "Name of competency",
        "text": "The question text",
        "category": "Behavioral", "Competency", or "Deceiving",
        "explanation": "Why this question is good",
        "rubric_good": "Indicators of a good answer",
        "rubric_bad": "Red flags"
      }
    `

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${openAiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are a helpful assistant that outputs JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
        }),
    })

    const data = await response.json()
    const content = data.choices[0].message.content
    const result = JSON.parse(content)

    // Normalize output
    const questions = Array.isArray(result) ? result : result.questions || []

    return new Response(JSON.stringify(questions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

} catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}
})
