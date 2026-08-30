import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExamAPI } from "../../services/exam.service";

type SaveState = "idle" | "saving" | "saved" | "queued" | "error";
type AnswerValue = string | string[];

type QueueItem = {
  attemptId: string;
  questionId: string;
  answer: AnswerValue;
  savedAt: string;
  lastQuestionId?: string;
};

const queueKey = (attemptId: string) => `exam-answer-queue:${attemptId}`;

const readQueue = (attemptId: string): QueueItem[] => {
  try {
    return JSON.parse(localStorage.getItem(queueKey(attemptId)) || "[]") as QueueItem[];
  } catch {
    return [];
  }
};

const writeQueue = (attemptId: string, queue: QueueItem[]) => {
  localStorage.setItem(queueKey(attemptId), JSON.stringify(queue));
};

export function useAnswerAutosave(
  attemptId: string,
  onSaved?: (questionId: string, savedAt: string) => void
) {
  const [status, setStatus] = useState<SaveState>("idle");
  const timers = useRef<Record<string, number>>({});

  // onSaved disimpan lewat ref (bukan lewat dependency array useCallback di
  // bawah) supaya saveNow/flushQueue/scheduleSave tetap stabil identitasnya
  // walau caller (ExamPage) mengirim function baru tiap render (arrow
  // function inline). Kalau tidak, useEffect di bawah yang clearTimeout
  // semua timer akan ikut re-run tiap render dan MEMBATALKAN timer autosave
  // 500ms sebelum sempat menyala - jawaban jadi tidak pernah benar-benar
  // terkirim ke server meskipun terlihat tersimpan di layar.
  const onSavedRef = useRef(onSaved);
  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  const flushQueue = useCallback(async () => {
    if (!navigator.onLine) return;

    const queue = readQueue(attemptId);
    if (queue.length === 0) return;

    const remaining: QueueItem[] = [];
    for (const item of queue) {
      try {
        await ExamAPI.saveAnswer(item.attemptId, {
          questionId: item.questionId,
          question_id: item.questionId,
          answer: item.answer,
          savedAt: item.savedAt,
          saved_at: item.savedAt,
          lastQuestionId: item.lastQuestionId,
        });
        onSavedRef.current?.(item.questionId, item.savedAt);
      } catch {
        remaining.push(item);
      }
    }

    writeQueue(attemptId, remaining);
    setStatus(remaining.length ? "queued" : "saved");
  }, [attemptId]);

  const saveNow = useCallback(
    async (questionId: string, answer: AnswerValue, lastQuestionId?: string) => {
      const savedAt = new Date().toISOString();
      const item = { attemptId, questionId, answer, savedAt, lastQuestionId };

      if (!navigator.onLine) {
        writeQueue(attemptId, [
          ...readQueue(attemptId).filter((q) => q.questionId !== questionId),
          item,
        ]);
        setStatus("queued");
        return;
      }

      try {
        setStatus("saving");
        await ExamAPI.saveAnswer(attemptId, {
          questionId,
          question_id: questionId,
          answer,
          savedAt,
          saved_at: savedAt,
          lastQuestionId,
        });
        onSavedRef.current?.(questionId, savedAt);
        setStatus("saved");
      } catch {
        writeQueue(attemptId, [
          ...readQueue(attemptId).filter((q) => q.questionId !== questionId),
          item,
        ]);
        setStatus("queued");
      }
    },
    [attemptId]
  );

  const scheduleSave = useCallback(
    (questionId: string, answer: AnswerValue, lastQuestionId?: string) => {
      setStatus("saving");
      window.clearTimeout(timers.current[questionId]);
      timers.current[questionId] = window.setTimeout(() => {
        void saveNow(questionId, answer, lastQuestionId);
      }, 500);
    },
    [saveNow]
  );

  useEffect(() => {
    const activeTimers = timers.current;
    const initialFlush = window.setTimeout(() => {
      void flushQueue();
    }, 0);

    window.addEventListener("online", flushQueue);

    return () => {
      window.clearTimeout(initialFlush);
      window.removeEventListener("online", flushQueue);
      Object.values(activeTimers).forEach(window.clearTimeout);
    };
  }, [flushQueue]);

  return useMemo(
    () => ({
      status,
      scheduleSave,
      flushQueue,
    }),
    [flushQueue, scheduleSave, status]
  );
}
