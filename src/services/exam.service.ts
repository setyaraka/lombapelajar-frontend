import api from "../api/axios";

export type ExamStatusCode =
  | "NOT_STARTED"
  | "SCHEDULE_ENDED"
  | "AVAILABLE"
  | "IN_PROGRESS"
  | "FINISHED";

export type ExamStatus = {
  examId: string;
  status: ExamStatusCode;
  label: string;
};

// Dipakai di CompetitionDetail untuk menampilkan nama & jadwal tiap ujian
// yang di-assign ke peserta (1 kompetisi bisa punya beberapa ujian).
export type ExamScheduleItem = ExamStatus & {
  examTitle: string;
  stageName: string | null;
  startAt: string;
  endAt: string;
};

export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "ESSAY";

export type ExamQuestion = {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  options: { id: string; text: string }[];
  answer: string | string[] | null;
  savedAt: string | null;
};

export type ExamAttemptPayload = {
  serverTime: string;
  exam: {
    id: string;
    competitionId: string;
    title: string;
    description: string | null;
    startAt: string;
    endAt: string;
    durationMinutes: number;
    announcementAt: string | null;
    resultPublished: boolean;
  };
  attempt: {
    id: string;
    examId: string;
    status: "IN_PROGRESS" | "FINISHED" | "EXPIRED";
    startedAt: string;
    expiredAt: string;
    finishedAt: string | null;
    lastQuestionId: string | null;
    questions: ExamQuestion[];
    answers: {
      questionId: string;
      answer: string | string[];
      savedAt: string;
    }[];
  };
};

export type SaveAnswerPayload = {
  question_id?: string;
  questionId: string;
  answer: string | string[];
  saved_at?: string;
  savedAt: string;
  lastQuestionId?: string;
};

export type ExamResult = {
  serverTime: string;
  announced: boolean;
  announcementAt: string | null;
  status: string | null;
  score: number | null;
  rank: number | null;
  notes: string;
};

const withRetry = async <T>(fn: () => Promise<T>, retries = 2): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    return withRetry(fn, retries - 1);
  }
};

export const ExamAPI = {
  startAttempt: async (competitionId: string, examId?: string) => {
    const res = await api.post<ExamAttemptPayload>("/attempt/start", { competitionId, examId });
    return res.data;
  },

  getCurrentAttempt: async (params: { attemptId?: string; competitionId?: string }) => {
    const res = await api.get<ExamAttemptPayload>("/attempt/current", { params });
    return res.data;
  },

  saveAnswer: async (attemptId: string, payload: SaveAnswerPayload) => {
    const res = await withRetry(() => api.patch(`/attempt/${attemptId}/answer`, payload));
    return res.data;
  },

  saveLastQuestion: async (attemptId: string, questionId: string) => {
    await api.patch(`/attempt/${attemptId}/last-question`, { questionId });
  },

  logActivity: async (
    attemptId: string,
    event: "ANSWER_CHANGED" | "TAB_SWITCH" | "WINDOW_BLUR" | "WINDOW_FOCUS",
    metadata?: Record<string, unknown>
  ) => {
    await api.post(`/attempt/${attemptId}/log`, { event, metadata });
  },

  submitAttempt: async (attemptId: string, auto = false) => {
    const res = await api.post(`/attempt/${attemptId}/submit`, { auto });
    return res.data;
  },

  getResult: async (competitionId: string) => {
    const res = await api.get<ExamResult>("/attempt/result", { params: { competitionId } });
    return res.data;
  },
};
