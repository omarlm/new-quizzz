import {useEffect, useState} from 'react';
import {supabase} from '../services/supabaseClient';

const Quiz = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [answers, setAnswers] = useState([]);

    const cleanOptionText = (text) => {
        return text.replace(/^\d+\.\s*/, ''); // Elimina números seguidos de un punto y espacio
    };

    const fetchQuestions = async () => {
        const {data: questions, error} = await supabase
            .from('w_questions')
            .select('*');

        if (error) {
            console.error('Error fetching questions:', error);
        } else {
            const cleanedQuestions = questions.map(question => {
                const cleanedOptions = {};
                for (let key in question.options) {
                    cleanedOptions[key] = cleanOptionText(question.options[key]);
                }
                return {
                    ...question,
                    options: cleanedOptions
                };
            });
            setQuestions(cleanedQuestions.sort(() => 0.5 - Math.random()).slice(0, 20)); // Shuffle and get 20 questions
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleAnswerOptionClick = (isCorrect, key) => {
        setSelectedOption(key);
        setAnswers([
            ...answers,
            {
                question: questions[currentQuestionIndex].question,
                selectedAnswer: key,
                correctAnswer: questions[currentQuestionIndex].correct_answer,
                isCorrect,
            },
        ]);

        if (isCorrect) {
            setScore(score + 1);
        }

        setTimeout(() => {
            setSelectedOption(null);
            const nextQuestion = currentQuestionIndex + 1;
            if (nextQuestion < questions.length) {
                setCurrentQuestionIndex(nextQuestion);
            } else {
                setShowScore(true);
            }
        }, 1000); // Wait 1 second before showing next question
    };

    const restartQuiz = () => {
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowScore(false);
        setSelectedOption(null);
        setAnswers([]);
        fetchQuestions();
    };

    return (
        <div className="quiz">
            {showScore ? (
                <div className="score-section">
                    <h2>Tu puntuación es {score} de {questions.length}</h2>
                    <h3>Resumen</h3>
                    <ul>
                        {answers.map((answer, index) => {
                            const question = questions.find(q => q.question === answer.question);
                            return (
                                <li key={index} style={{color: answer.isCorrect ? 'green' : 'red'}}>
                                    <p><strong>Q:</strong> {answer.question}</p>
                                    <p><strong>A:</strong> {question.options[answer.selectedAnswer]}</p>
                                    {!answer.isCorrect && (
                                        <>
                                            <p><strong>Correct answer:</strong> {question.options[answer.correctAnswer]}</p>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                    <button onClick={restartQuiz}>Restart Quiz</button>
                </div>
            ) : (
                <>
                    {questions.length > 0 && (
                        <div className="question-section">
                            <div className="question-count">
                                <span>Pregunta {currentQuestionIndex + 1}</span>/{questions.length}
                            </div>
                            <div className="question-text">{questions[currentQuestionIndex].question}</div>
                        </div>
                    )}
                    <div className="answer-section">
                        {questions.length > 0 &&
                            Object.entries(questions[currentQuestionIndex].options).map(([key, value]) => (
                                <button
                                    key={key}
                                    className={selectedOption === key ? (key === questions[currentQuestionIndex].correct_answer ? 'correct' : 'incorrect') : ''}
                                    onClick={() => handleAnswerOptionClick(key === questions[currentQuestionIndex].correct_answer, key)}
                                    disabled={selectedOption !== null}
                                >
                                    {key}) {value}
                                </button>
                            ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Quiz;
