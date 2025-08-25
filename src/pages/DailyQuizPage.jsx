import { useEffect, useState } from 'react'
import { db } from "@/fbkit"
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
          <h2>ｧ 蝠城｡・ {quiz.text}</h2>
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
              <p>{result ? '箝・豁｣隗｣・√☆縺斐＞・・ : '笶・縺悶ｓ縺ｭ繧凪ｦ'}</p>
              <button onClick={handleNext}>縺､縺弱・繧ゅｓ縺縺・∈ 笆ｶ</button>
            </>
          )}
        </>
      ) : (
        <p>縺吶∋縺ｦ縺ｮ蝠城｡後′邨ゅｏ縺｣縺溘ｈ・Å沁・/p>
      )}
    </div>
  )
}

export default DailyQuizPage
