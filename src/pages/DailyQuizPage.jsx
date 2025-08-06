import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'

function DailyQuizPage() {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      const querySnapshot = await getDocs(collection(db, 'dailyQuestions'))
      const quizDocs = querySnapshot.docs.map(doc => doc.data())
      const todayQuestions = quizDocs[0]?.questions || []
      setQuestions(todayQuestions)
    }

    fetchQuiz()
  }, [])

  const handleAnswer = (choice) => {
    setSelected(choice)
    setResult(choice === questions[currentIndex].answer)
  }

  const handleNext = () => {
    setSelected(null)
    setResult(null)
    setCurrentIndex((prev) => prev + 1)
  }

  const quiz = questions[currentIndex]

  return (
    <div style={{ padding: '2rem' }}>
      {quiz ? (
        <>
          <h2>🧠 問題: {quiz.text}</h2>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {quiz.options.map((choice, idx) => (
              <li key={idx} style={{ margin: '8px 0' }}>
                <button onClick={() => handleAnswer(choice)}>
                  {choice}
                </button>
              </li>
            ))}
          </ul>
          {selected && (
            <>
              <p>{result ? '⭕ 正解！すごい！' : '❌ ざんねん…'}</p>
              <button onClick={handleNext}>つぎのもんだいへ ▶</button>
            </>
          )}
        </>
      ) : (
        <p>すべての問題が終わったよ！🎉</p>
      )}
    </div>
  )
}

export default DailyQuizPage
