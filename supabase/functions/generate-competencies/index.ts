
try {
    const { jobTitle, jobDescription } = await req.json()

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
        throw new Error('Missing OPENAI_API_KEY')
    }

    const prompt = `
      You are an expert HR consultant. Analyze the following job description and extract 3-5 key competencies required for the role.
      
      Job Title: ${jobTitle}
      Job Description:
      ${jobDescription.substring(0, 3000)} -- truncated if too long

      Return a JSON array of objects with "name" and "description" keys.
      Example:
      [
        { "name": "Strategic Planning", "description": "Ability to set long-term goals..." },
        { "name": "Python Proficiency", "description": "Strong experience with Python..." }
      ]
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
    const competencies = JSON.parse(content).competencies || JSON.parse(content)

    // Handle case where AI wraps it in a key
    const result = Array.isArray(competencies) ? competencies : competencies.competencies || []

    return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

} catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}
})
