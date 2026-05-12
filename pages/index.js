import { useState } from 'react'

export default function Home() {
  const [q, setQ] = useState(0)
  const [ans, setAns] = useState({})
  const [page, setPage] = useState('landing')
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(false)

  const RECIPES = [
    { icon: '✉️', name: 'Correspondent' },
    { icon: '🎙️', name: 'Listener' },
    { icon: '🛠️', name: 'Builder' },
    { icon: '💬', name: 'Debater' },
    { icon: '📚', name: 'Researcher' },
    { icon: '👨‍🎓', name: 'Apprentice' },
    { icon: '🎯', name: 'Studier' }
  ]

  const QUIZ = [
    { q: 'How do you prefer to learn?', k: 'fmt', o: ['Reading', 'Listening', 'Doing', 'Debating', 'Researching', 'Examples', 'Quick facts'] },
    { q: 'Your role?', k: 'role', o: ['Manager', 'Executive', 'Founder', 'IC', 'Student', 'Other'] },
    { q: 'Your industry?', k: 'ind', o: ['Tech', 'Finance', 'Healthcare', 'Other'] },
    { q: 'What scares you?', k: 'fear', o: ['Replaced', 'Not knowing', 'Privacy', 'Moving fast', 'Wont help'] },
    { q: 'Time available?', k: 'time', o: ['30min', '1hr', '2hr', '5+hr'] }
  ]

  const handleAnswer = (key, val) => {
    setAns({ ...ans, [key]: val })
  }

  const nextQ = () => {
    if (q < QUIZ.length - 1) {
      setQ(q + 1)
    } else {
      setPage('recipe')
    }
  }

  const handlePayment = async () => {
    setPage('loading')
    setLoading(true)
    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ans })
      })
      const data = await res.json()
      setLesson(data.lesson)
      setPage('lesson')
    } catch (e) {
      alert('Error: ' + e.message)
      setPage('payment')
    }
    setLoading(false)
  }

  const rec = RECIPES[Object.keys(ans)[0]?.length % 7]

  return (
    <div style={styles.app}>
      {page === 'landing' && (
        <div style={styles.page}>
          <h1 style={styles.h1}>AL</h1>
          <p style={styles.p}>One lesson per week</p>
          <p style={styles.p}>Your way</p>
          <button style={styles.btnPrimary} onClick={() => setPage('quiz')}>Take Quiz</button>
        </div>
      )}

      {page === 'quiz' && (
        <div style={styles.page}>
          <p>Question {q + 1} of {QUIZ.length}</p>
          <h2>{QUIZ[q].q}</h2>
          <div>
            {QUIZ[q].o.map(o => (
              <button
                key={o}
                style={{
                  ...styles.quizOption,
                  background: ans[QUIZ[q].k] === o ? '#4AE68A' : 'rgba(255,255,255,0.08)',
                  color: ans[QUIZ[q].k] === o ? '#08080D' : '#F2EFE8'
                }}
                onClick={() => handleAnswer(QUIZ[q].k, o)}
              >
                {o}
              </button>
            ))}
          </div>
          <button style={styles.btnPrimary} onClick={nextQ} disabled={!ans[QUIZ[q].k]}>Next</button>
        </div>
      )}

      {page === 'recipe' && rec && (
        <div style={styles.page}>
          <div style={styles.icon}>{rec.icon}</div>
          <h2>{rec.name}</h2>
          <button style={styles.btnPrimary} onClick={() => setPage('payment')}>See Lesson ($0.99)</button>
          <button style={styles.btnSecondary} onClick={() => setPage('quiz')}>Back</button>
        </div>
      )}

      {page === 'payment' && (
        <div style={styles.page}>
          <h2>Unlock This Lesson</h2>
          <p>One custom lesson tailored to you</p>
          <button style={styles.btnPrimary} onClick={handlePayment} disabled={loading}>Pay $0.99</button>
          <button style={styles.btnSecondary} onClick={() => setPage('recipe')}>Back</button>
        </div>
      )}

      {page === 'loading' && (
        <div style={styles.page}>
          <div style={styles.icon}>✨</div>
          <h2>Generating lesson...</h2>
        </div>
      )}

      {page === 'lesson' && lesson && (
        <div style={styles.page}>
          <h2>Your Lesson</h2>
          <div style={styles.lessonSection}>{lesson}</div>
          <button style={styles.btnPrimary} onClick={() => setPage('landing')}>Home</button>
        </div>
      )}
    </div>
  )
}

const styles = {
  app: { minHeight: '100vh', background: '#08080D', color: '#F2EFE8', fontFamily: 'Outfit, sans-serif', display: 'flex', flexDirection: 'column' },
  page: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px' },
  h1: { fontFamily: 'Cormorant Garamond, serif', fontSize: '64px', marginBottom: '20px', color: '#F2EFE8' },
  p: { color: '#C8C4B8', marginBottom: '12px' },
  btnPrimary: { padding: '16px 32px', background: 'linear-gradient(135deg, #4AE68A, #2A8B52)', color: '#08080D', border: 'none', borderRadius: '100px', cursor: 'pointer', marginTop: '12px', fontSize: '15px', fontWeight: 'bold', maxWidth: '360px', width: '100%' },
  btnSecondary: { padding: '16px 32px', background: 'rgba(255,255,255,0.08)', color: '#F2EFE8', border: '1px solid #22222F', borderRadius: '100px', cursor: 'pointer', marginTop: '12px', fontSize: '15px', maxWidth: '360px', width: '100%' },
  quizOption: { padding: '14px', margin: '10px auto', border: '2px solid #22222F', borderRadius: '12px', cursor: 'pointer', maxWidth: '360px', width: '100%', fontFamily: 'Outfit' },
  icon: { fontSize: '48px', margin: '16px 0' },
  lessonSection: { background: 'rgba(255,255,255,0.04)', border: '1px solid #4AE68A', borderRadius: '8px', padding: '20px', margin: '20px auto', maxWidth: '600px', textAlign: 'left', lineHeight: '1.8', whiteSpace: 'pre-wrap' }
}
