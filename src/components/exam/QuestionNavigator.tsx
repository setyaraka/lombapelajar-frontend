import type { ExamQuestion } from "../../services/exam.service";

type Props = {
  questions: ExamQuestion[];
  activeQuestionId: string;
  answers: Record<string, string | string[]>;
  onSelect: (questionId: string) => void;
};

export default function QuestionNavigator({
  questions,
  activeQuestionId,
  answers,
  onSelect,
}: Props) {
  return (
    <aside className="question-navigator">
      <div className="question-navigator-title">Nomor Soal</div>
      <div className="question-grid">
        {questions.map((question, index) => {
          const answer = answers[question.id];
          const answered = Array.isArray(answer) ? answer.length > 0 : Boolean(answer);
          const active = question.id === activeQuestionId;

          return (
            <button
              key={question.id}
              type="button"
              className={`question-number ${active ? "active" : ""} ${answered ? "answered" : ""}`}
              onClick={() => onSelect(question.id)}
              aria-label={`Soal ${index + 1}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="question-legend">
        <span>
          <i className="legend-dot answered" /> Sudah dijawab
        </span>
        <span>
          <i className="legend-dot" /> Belum dijawab
        </span>
      </div>
    </aside>
  );
}
