import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';

import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg';
import answerImg from '../assets/images/answer.svg';
import checkImg from '../assets/images/check.svg';
import emptyQuestionsImg from '../assets/images/empty-questions.svg';

import { Button } from '../components/Button';
import { Question } from '../components/Question';
import { RoomCode } from '../components/RoomCode';
import { useRoom } from '../hooks/useRoom';

import { database } from '../services/firebase';

import '../styles/room.scss';

type RoomParams = {
    id: string;
}

export function AdminRoom(){    
    const params = useParams<RoomParams>();
    const roomId = params.id;
    const history = useHistory();

    const { questions, title } = useRoom(roomId);

    async function handleEndRoom() {
        await database.ref(`rooms/${roomId}`).update({
            closedAt: new Date()
        })

        history.push('/');
    }

    async function handleCheckQuestionAsAnswered(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isAnswered: true
        })
    }

    async function handleHighlightQuestion(questionId: string, isHighlighted: boolean) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isHighlighted: !isHighlighted
        })
    }

    async function handleDeleteQuestion(questionId: string) {
        if(window.confirm("Tem certeza que deseja excluir esta pergunta?")) {
            await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
        }
    }

    return (
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <div>
                        <RoomCode code={roomId}/>
                        <Button isOutlined onClick={handleEndRoom}>Encerrar sala</Button>
                    </div>
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    { questions.length > 0 && (<span>{questions.length} pergunta(s)</span>)}
                </div>

                { questions.length > 0 ? (
                    <div className="question-list">
                        { questions.map(question => {
                            return (
                                <Question 
                                    key={question.id}
                                    content={question.content}
                                    author={question.author}
                                    isAnswered={question.isAnswered}
                                    isHighlighted={question.isHighlighted}
                                >
                                    {!question.isAnswered && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleCheckQuestionAsAnswered(question.id)}
                                            >
                                                <img src={checkImg} alt="Marcar pergunta como respondida" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleHighlightQuestion(question.id, question.isHighlighted)}
                                            >
                                                <img src={answerImg} alt="Dar destaque ?? pergunta" />
                                            </button>
                                        </>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteQuestion(question.id)}
                                    >
                                        <img src={deleteImg} alt="Remover pergunta" />
                                    </button>
                                </Question>
                                )
                            })
                        }
                    </div>
                ) : (
                    <div className="empty-question-list">
                        <img src={emptyQuestionsImg} alt="Bal??es de perguntas" />
                        <p>Nenhuma pergunta por aqui...</p>
                        <span>Envie o c??digo desta sala para seus amigos e comece a responder perguntas!</span>
                    </div>
                )}
            </main>
        </div>
    )
}