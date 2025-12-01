export async function generateCompetencies(jobTitle: string, jobDescription: string, apiKey: string) {
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
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
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
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate competencies');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    let parsed;
    try {
        parsed = JSON.parse(content);
    } catch (e) {
        console.error("Failed to parse OpenAI response:", content);
        return [];
    }

    if (Array.isArray(parsed)) return parsed;
    if (parsed.competencies && Array.isArray(parsed.competencies)) return parsed.competencies;

    // Fallback: try to find any array in the object
    const values = Object.values(parsed);
    const arrayValue = values.find(v => Array.isArray(v));
    return arrayValue || [];
}

export async function generateQuestions(jobTitle: string, competencies: any[], apiKey: string, count: number = 2) {
    const prompt = `
      You are an expert HR consultant. Generate interview questions for the following competencies for the role of ${jobTitle}.
      
      Competencies:
      ${JSON.stringify(competencies)}

      For EACH competency, generate ${count} questions.
      Mix of "Behavioral" and "Competency" types.

      Return a JSON array of objects with the following structure:
      {
        "competencyName": "Name of competency",
        "text": "The question text",
        "category": "Behavioral" or "Competency",
        "explanation": "Why this question is good",
        "rubric_good": "Indicators of a good answer",
        "rubric_bad": "Red flags"
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
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
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate questions');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    let parsed;
    try {
        parsed = JSON.parse(content);
    } catch (e) {
        console.error("Failed to parse OpenAI response:", content);
        return [];
    }

    if (Array.isArray(parsed)) return parsed;
    if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;

    // Fallback: try to find any array in the object
    const values = Object.values(parsed);
    const arrayValue = values.find(v => Array.isArray(v));
    return arrayValue || [];
}

export async function generateKitScore(jobTitle: string, jobDescription: string, questions: any[], apiKey: string) {
    const prompt = `
      You are an expert HR consultant. Evaluate the quality of the following interview kit for the role of ${jobTitle}.
      
      Job Description:
      ${jobDescription.substring(0, 1000)}...

      Generated Questions:
      ${JSON.stringify(questions.map(q => ({ text: q.text, category: q.category })))}

      Rate the quality of this interview kit on a scale of 0 to 100 based on:
      1. Relevance to the job description.
      2. Variety of question types (Behavioral, Competency, etc.).
      3. Depth and clarity of questions.

      Return a JSON object with:
      {
        "score": number (0-100),
        "explanation": "A brief explanation of the score (max 2 sentences)."
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
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
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate kit score');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    try {
        return JSON.parse(content);
    } catch (e) {
        console.error("Failed to parse OpenAI response:", content);
        return { score: 0, explanation: "Failed to generate score." };
    }
}
