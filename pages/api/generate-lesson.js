export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ans } = req.body
  const API_KEY = process.env.ANTHROPIC_API_KEY
  const prompt = `Create a lesson for a ${ans.role} in ${ans.ind} concerned about ${ans.fear}. They prefer ${ans.fmt} and have ${ans.time} available. Be practical and actionable.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await response.json()
    const lesson = data.content[0].text
    res.status(200).json({ lesson })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
