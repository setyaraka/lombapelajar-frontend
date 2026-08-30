const activeAttemptKey = "active-exam-attempt";

export type ActiveExamAttempt = {
  attemptId: string;
  competitionId: string;
};

export const ExamResume = {
  remember(attempt: ActiveExamAttempt) {
    localStorage.setItem(activeAttemptKey, JSON.stringify(attempt));
  },

  forget() {
    localStorage.removeItem(activeAttemptKey);
  },

  read(): ActiveExamAttempt | null {
    try {
      return JSON.parse(
        localStorage.getItem(activeAttemptKey) || "null"
      ) as ActiveExamAttempt | null;
    } catch {
      return null;
    }
  },
};
