import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Success() {
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const generateLesson = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session_id')

        // TODO: Verify session with Stripe backend (for production)
        // For now, we trust the redirect

        // Get quiz answers from localStorage
        const savedAnswers = JSON.parse(localStorage.getItem('quizAnswers') || '{}')

        const res = await fetch('/api/generate-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: savedAnswers }),
        })

        const data = await res.json()
        setLesson(data)

        // Save to library
        const library = JSON.parse(localStorage.getItem('lessonLibrary') || '[]')
        library.push({
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          recipe: savedAnswers.recipe,
          title: data.title,
          content: data.content,
          quiz: data.quiz,
        })
        localStorage.setItem('lessonLibrary', JSON.stringify(library))
        localStorage.setItem('lastLessonDate', new Date().toDateString())

        setLoading(false)
      } catch (error) {
        console.error('Error generating lesson:', error)
        setLoading(false)
      }
    }

    generateLesson()
  }, [])

  const handleQuizSubmit = () => {
    if (!lesson) return
    let correct = 0
    lesson.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correctAnswer) correct++
    })
    setScore(correct)
    setQuizSubmitted(true)

    // Save score
    const scores = JSON.parse(localStorage.getItem('quizScores') || '[]')
    scores.push({
      date: new Date().toLocaleDateString(),
      score: `${correct}/${lesson.quiz.length}`,
    })
    localStorage.setItem('quizScores', JSON.stringify(scores))
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Generating your lesson...</div>
  }

  if (!lesson) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Error loading lesson</div>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{lesson.title}</h1>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '2rem' }}>
        {lesson.content}
      </div>

      <h2>Quick Quiz</h2>
      {lesson.quiz.map((q, i) => (
        <div key={i} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <p><strong>{q.question}</strong></p>
          {q.options.map((opt, j) => (
            <label key={j} style={{ display: 'block', margin: '0.5rem 0' }}>
              <input
                type="radio"
                name={`q${i}`}
                value={opt}
                checked={quizAnswers[i] === opt}
                onChange={(e) => setQuizAnswers({ ...quizAnswers, [i]: e.target.value })}
                disabled={quizSubmitted}
              />
              {' '}{opt}
            </label>
          ))}
        </div>
      ))}

      {!quizSubmitted ? (
        <button onClick={handleQuizSubmit} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}>
          Submit Quiz
        </button>
      ) : (
        <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '8px', marginTop: '1rem' }}>
          <p><strong>Score: {score}/{lesson.quiz.length}</strong></p>
          <p>{score === lesson.quiz.length ? '🎉 Perfect!' : 'Great effort! Review the lesson and try again tomorrow.'}</p>
          <a href="/" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#4AE68A', color: '#08080D', textDecoration: 'none', borderRadius: '4px' }}>
            Back to Home
          </a>
        </div>
      )}
    </div>
  )
}
