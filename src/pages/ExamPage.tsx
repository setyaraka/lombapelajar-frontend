import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ExamTimer from "../components/exam/ExamTimer";
import QuestionNavigator from "../components/exam/QuestionNavigator";
import { useAnswerAutosave } from "../components/exam/AnswerAutosave";
import { useExamGuard } from "../components/exam/ExamGuard";
import { ExamResume } from "../components/exam/ExamResume";
import { ExamAPI, type ExamAttemptPayload, type ExamQuestion } from "../services/exam.service";
import { renderFormattedText } from "../helper/format";

type AnswerValue = string | string[];

const normalizeInitialAnswers = (questions: ExamQuestion[]) =>
  questions.reduce<Record<string, AnswerValue>>((acc, question) => {
    if (question.answer) acc[question.id] = question.answer;
    return acc;
  }, {});

export default function ExamPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [payload, setPayload] = useState<ExamAttemptPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState("");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [savedAtMap, setSavedAtMap] = useState<Record<string, string>>({});

  const guard = useExamGuard(attemptId || "");
  const autosave = useAnswerAutosave(attemptId || "", (questionId, savedAt) => {
    setSavedAtMap((prev) => ({ ...prev, [questionId]: savedAt }));
  });

  useEffect(() => {
    const load = async () => {
      if (!attemptId) return;

      try {
        const data = await ExamAPI.getCurrentAttempt({ attemptId });
        if (data.attempt.status !== "IN_PROGRESS") {
          navigate(`/competition/${data.exam.competitionId}/announcement`, { replace: true });
          return;
        }

        setPayload(data);
        setAnswers(normalizeInitialAnswers(data.attempt.questions));
        setSavedAtMap(
          data.attempt.answers.reduce<Record<string, string>>((acc, answer) => {
            acc[answer.questionId] = answer.savedAt;
            return acc;
          }, {})
        );
        setActiveQuestionId(data.attempt.lastQuestionId || data.attempt.questions[0]?.id || "");
        ExamResume.remember({ attemptId: data.attempt.id, competitionId: data.exam.competitionId });
      } catch {
        toast.error("Gagal memuat attempt ujian");
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [attemptId, navigate]);

  const activeIndex = useMemo(() => {
    if (!payload) return -1;
    return payload.attempt.questions.findIndex((question) => question.id === activeQuestionId);
  }, [activeQuestionId, payload]);

  const activeQuestion = payload?.attempt.questions[activeIndex] || null;

  const handleSelectQuestion = (questionId: string) => {
    setActiveQuestionId(questionId);
    if (attemptId) void ExamAPI.saveLastQuestion(attemptId, questionId).catch(() => undefined);
  };

  const handleAnswerChange = (question: ExamQuestion, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    autosave.scheduleSave(question.id, value, question.id);
    if (attemptId) {
      void ExamAPI.logActivity(attemptId, "ANSWER_CHANGED", { questionId: question.id }).catch(
        () => undefined
      );
    }
  };

  const submit = useCallback(
    async (auto = false) => {
      if (!payload || !attemptId || submitting) return;

      try {
        setSubmitting(true);
        await autosave.flushQueue();
        await ExamAPI.submitAttempt(attemptId, auto);
        ExamResume.forget();
        toast.success(
          auto ? "Waktu habis. Ujian otomatis dikumpulkan." : "Ujian berhasil dikumpulkan."
        );
        navigate(`/competition/${payload.exam.competitionId}/announcement`, { replace: true });
      } catch {
        toast.error("Gagal submit ujian. Coba lagi.");
      } finally {
        setSubmitting(false);
      }
    },
    [attemptId, autosave, navigate, payload, submitting]
  );

  if (loading || !payload || !activeQuestion) return <Loading fullScreen text="Memuat ujian..." />;

  return (
    <div className="exam-page">
      <Header />

      {!guard.online && (
        <div className="exam-network-banner">
          Koneksi terputus. Jawaban akan dikirim kembali saat koneksi tersedia.
        </div>
      )}

      {guard.warning && (
        <div className="exam-warning" role="alert">
          <span>{guard.warning}</span>
          <button type="button" onClick={guard.clearWarning}>
            Tutup
          </button>
        </div>
      )}

      <main className="container exam-shell">
        <div className="exam-topbar">
          <div>
            <p className="exam-eyebrow">Ujian</p>
            <h1>{payload.exam.title}</h1>
          </div>
          <ExamTimer
            serverTime={payload.serverTime}
            expiredAt={payload.attempt.expiredAt}
            onExpire={() => void submit(true)}
          />
        </div>

        <div className="exam-layout">
          <QuestionNavigator
            questions={payload.attempt.questions}
            activeQuestionId={activeQuestionId}
            answers={answers}
            onSelect={handleSelectQuestion}
          />

          <section className="exam-question-panel">
            <div className="exam-question-header">
              <span>Soal {activeIndex + 1}</span>
              <span className={`save-status ${autosave.status}`}>
                {autosave.status === "saving" && "Saving..."}
                {autosave.status === "saved" && "Saved"}
                {autosave.status === "queued" && "Menunggu koneksi"}
                {autosave.status === "error" && "Gagal menyimpan"}
              </span>
            </div>

            <p className="exam-question-text">{renderFormattedText(activeQuestion.text)}</p>

            {activeQuestion.type === "ESSAY" ? (
              <textarea
                className="exam-essay"
                value={(answers[activeQuestion.id] as string) || ""}
                onChange={(e) => handleAnswerChange(activeQuestion, e.target.value)}
                placeholder="Tulis jawaban Anda..."
              />
            ) : (
              <div className="exam-options">
                {activeQuestion.options.map((option) => {
                  const currentAnswer = answers[activeQuestion.id];
                  const checked = Array.isArray(currentAnswer)
                    ? currentAnswer.includes(option.id)
                    : currentAnswer === option.id;

                  return (
                    <label key={option.id} className="exam-option">
                      <input
                        type={activeQuestion.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"}
                        name={activeQuestion.id}
                        checked={checked}
                        onChange={(e) => {
                          if (activeQuestion.type === "MULTIPLE_CHOICE") {
                            const previous = Array.isArray(currentAnswer) ? currentAnswer : [];
                            const next = e.target.checked
                              ? [...previous, option.id]
                              : previous.filter((id) => id !== option.id);
                            handleAnswerChange(activeQuestion, next);
                          } else {
                            handleAnswerChange(activeQuestion, option.id);
                          }
                        }}
                      />
                      <span>{renderFormattedText(option.text)}</span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="exam-actions">
              <button
                type="button"
                className="btn secondary"
                disabled={activeIndex <= 0}
                onClick={() => handleSelectQuestion(payload.attempt.questions[activeIndex - 1].id)}
              >
                Sebelumnya
              </button>
              <button
                type="button"
                className="btn secondary"
                disabled={activeIndex >= payload.attempt.questions.length - 1}
                onClick={() => handleSelectQuestion(payload.attempt.questions[activeIndex + 1].id)}
              >
                Berikutnya
              </button>
              <button
                type="button"
                className="btn"
                disabled={submitting}
                onClick={() => void submit(false)}
              >
                {submitting ? "Mengumpulkan..." : "Submit Ujian"}
              </button>
            </div>

            {savedAtMap[activeQuestion.id] && (
              <p className="exam-saved-note">
                Terakhir tersimpan{" "}
                {new Date(savedAtMap[activeQuestion.id]).toLocaleTimeString("id-ID")}
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
