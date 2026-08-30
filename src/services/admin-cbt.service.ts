import api from "../api/axios";

export interface CBTDashboardData {
  stats: {
    totalParticipants: number;
    totalExams: number;
    activeExams: number;
    upcomingExams: number;
    inProgress: number;
    finished: number;
    violations: number;
  };
  participantsPerExam: {
    data: {
      examId: string;
      title: string;
      competitionTitle: string;
      startAt: string;
      endAt: string;
      participants: number;
    }[];
    meta: PaginationMeta;
  };
}

export interface CBTStage {
  id: string;
  name: string;
  description?: string | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    participants: number;
    exams: number;
  };
}

export interface CBTExam {
  id: string;
  title: string;
  description?: string | null;
  stageId?: string | null;
  competitionId?: string | null;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
  isActive: boolean;
  maxAttempts: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  announcementAt?: string | null;
  resultPublished: boolean;
  createdAt: string;
  updatedAt: string;
  stage?: CBTStage | null;
  competition?: { id: string; title: string } | null;
  _count?: {
    assignments: number;
    questions: number;
    attempts: number;
  };
}

export interface CBTParticipant {
  id: string;
  userId?: string | null;
  stageId?: string | null;
  name: string;
  email: string;
  participantNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stage?: CBTStage | null;
  assignments?: {
    id: string;
    exam: {
      id: string;
      title: string;
      competition?: { id: string; title: string } | null;
    };
  }[];
  // Participant tidak punya competitionId langsung - lomba yang diikuti
  // ditelusuri lewat Registration milik User yang sama (lihat catatan di
  // backend cbtRepository.listParticipants). Bisa lebih dari satu kalau
  // user yang sama daftar di beberapa lomba berbeda.
  user?: {
    registrations?: {
      competition: { id: string; title: string };
    }[];
  } | null;
}

export interface CBTQuestionOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  position: number;
}

export interface CBTQuestion {
  id: string;
  examId: string;
  text: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "ESSAY";
  points: number;
  position: number;
  createdAt: string;
  options: CBTQuestionOption[];
}

export interface CBTMonitoringData {
  assignmentId: string;
  participant: {
    id: string;
    name: string;
    email: string;
    participantNumber: string;
  };
  exam: {
    id: string;
    title: string;
  };
  // Nama lomba/kompetisi exam ini — null kalau exam belum tergabung ke kompetisi manapun.
  competitionTitle: string | null;
  attemptId: string | null;
  status: "Waiting" | "In Progress" | "Finished" | "Auto Submitted" | "Disconnected";
  remainingMs: number;
  violationCount: number;
  answeredCount: number;
}

export interface CBTResultData {
  id: string;
  participantName: string;
  participantNumber: string;
  examTitle: string;
  // Nama lomba/kompetisi exam ini — null kalau exam belum tergabung ke kompetisi manapun.
  competitionTitle: string | null;
  score: number | null;
  // Ranking per Stage, diisi lewat tombol "Hitung Ranking" (admin-triggered,
  // bukan otomatis) — null berarti belum pernah dihitung untuk stage exam ini.
  rank: number | null;
  finishedAt: string | null;
  violationCount: number;
  answerCount: number;
}

export interface CBTEssayAnswer {
  answerId: string | null;
  questionId: string;
  text: string;
  points: number;
  answerKey: string | null;
  submittedAnswer: string;
  isCorrect: boolean | null;
  pointsEarned: number | null;
  gradedManually: boolean;
}

export interface CBTEssayAnswers {
  attemptId: string;
  participantName: string;
  examTitle: string;
  questions: CBTEssayAnswer[];
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export const AdminCBTAPI = {
  // Dashboard
  getDashboard: async (params?: Record<string, unknown>) => {
    const res = await api.get<CBTDashboardData>("/admin/cbt/dashboard", { params });
    return res.data;
  },

  // Stages
  listStages: async () => {
    const res = await api.get<CBTStage[]>("/admin/cbt/stages");
    return res.data;
  },
  createStage: async (data: Partial<CBTStage>) => {
    const res = await api.post<CBTStage>("/admin/cbt/stages", data);
    return res.data;
  },
  updateStage: async (id: string, data: Partial<CBTStage>) => {
    const res = await api.put<CBTStage>(`/admin/cbt/stages/${id}`, data);
    return res.data;
  },
  deleteStage: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/admin/cbt/stages/${id}`);
    return res.data;
  },
  recomputeStageRanking: async (stageId: string) => {
    const res = await api.post<{
      stageId: string;
      participantsRanked: number;
      attemptsUpdated: number;
    }>(`/admin/cbt/stages/${stageId}/recompute-ranking`);
    return res.data;
  },

  // Exams
  listExams: async (params?: Record<string, unknown>) => {
    const res = await api.get<{ data: CBTExam[]; meta: PaginationMeta }>("/admin/cbt/exams", {
      params,
    });
    return res.data;
  },
  getExam: async (id: string) => {
    const res = await api.get<CBTExam>(`/admin/cbt/exams/${id}`);
    return res.data;
  },
  createExam: async (data: Partial<CBTExam>) => {
    const res = await api.post<CBTExam>("/admin/cbt/exams", data);
    return res.data;
  },
  updateExam: async (id: string, data: Partial<CBTExam>) => {
    const res = await api.put<CBTExam>(`/admin/cbt/exams/${id}`, data);
    return res.data;
  },
  toggleExam: async (id: string, isActive: boolean) => {
    const res = await api.patch<CBTExam>(`/admin/cbt/exams/${id}/toggle`, { isActive });
    return res.data;
  },
  deleteExam: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/admin/cbt/exams/${id}`);
    return res.data;
  },

  // Participants
  listParticipants: async (params?: Record<string, unknown>) => {
    const res = await api.get<{ data: CBTParticipant[]; meta: PaginationMeta }>(
      "/admin/cbt/participants",
      { params }
    );
    return res.data;
  },
  listParticipantIds: async (params?: Record<string, unknown>) => {
    const res = await api.get<{ ids: string[] }>("/admin/cbt/participants/ids", { params });
    return res.data.ids;
  },
  createParticipant: async (data: Partial<CBTParticipant>) => {
    const res = await api.post<CBTParticipant>("/admin/cbt/participants", data);
    return res.data;
  },
  updateParticipant: async (id: string, data: Partial<CBTParticipant>) => {
    const res = await api.put<CBTParticipant>(`/admin/cbt/participants/${id}`, data);
    return res.data;
  },
  deleteParticipant: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/admin/cbt/participants/${id}`);
    return res.data;
  },
  assignParticipants: async (data: {
    participantIds?: string[];
    stageId?: string;
    examIds?: string[];
    examId?: string;
  }) => {
    const res = await api.post<{ assigned: number }>("/admin/cbt/assignments", data);
    return res.data;
  },

  // Questions
  listQuestions: async (examId: string) => {
    const res = await api.get<CBTQuestion[]>(`/admin/cbt/exams/${examId}/questions`);
    return res.data;
  },
  createQuestion: async (data: Partial<CBTQuestion>) => {
    const res = await api.post<CBTQuestion>("/admin/cbt/questions", data);
    return res.data;
  },
  updateQuestion: async (id: string, data: Partial<CBTQuestion>) => {
    const res = await api.put<CBTQuestion>(`/admin/cbt/questions/${id}`, data);
    return res.data;
  },
  deleteQuestion: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/admin/cbt/questions/${id}`);
    return res.data;
  },

  // Monitoring
  getMonitoring: async (params?: Record<string, unknown>) => {
    const res = await api.get<{
      data: CBTMonitoringData[];
      serverTime: string;
      meta: PaginationMeta;
    }>("/admin/cbt/monitoring", { params });
    return res.data;
  },

  // Results & Export
  getResults: async (params?: Record<string, unknown>) => {
    const res = await api.get<{ data: CBTResultData[]; meta: PaginationMeta }>(
      "/admin/cbt/results",
      { params }
    );
    return res.data;
  },
  exportResultsUrl: (params?: Record<string, unknown>) => {
    const token = localStorage.getItem("token");
    const query = new URLSearchParams({ ...params, token: token || "" }).toString();
    return `${import.meta.env.VITE_API_URL}/admin/cbt/results/export?${query}`;
  },
  exportResults: async (params?: Record<string, unknown>) => {
    const res = await api.get("/admin/cbt/results/export", {
      params,
      responseType: "blob",
    });
    return res.data;
  },
  exportResultsPdf: async (params?: Record<string, unknown>) => {
    const res = await api.get("/admin/cbt/results/export/pdf", {
      params,
      responseType: "blob",
    });
    return res.data;
  },
  listRegisteredUsers: async () => {
    const res = await api.get<unknown[]>("/admin/cbt/registered-users");
    return res.data;
  },

  // Koreksi manual esai
  getEssayAnswers: async (attemptId: string) => {
    const res = await api.get<CBTEssayAnswers>(`/admin/cbt/results/${attemptId}/essay-answers`);
    return res.data;
  },
  gradeEssayAnswer: async (
    answerId: string,
    data: { pointsEarned: number; isCorrect?: boolean }
  ) => {
    const res = await api.patch(`/admin/cbt/answers/${answerId}/grade`, data);
    return res.data;
  },
};
