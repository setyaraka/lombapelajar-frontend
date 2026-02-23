import api from "../api/axios";

export type CreateCompetitionPayload = {
  title: string;
  category: string;
  level: string;
  deadline: string;
  price: string;
  poster?: string;
  description: string;
  requirements: string[];
  timeline: { title: string; startDate: string; endDate: string }[];
};

export type CompetitionQuery = {
  page: number;
  perPage: number;
  search?: string;
  level?: string;
  category?: string;
};

export type CompetitionDetail = {
  id: string;
  title: string;
  description: string | null;
  poster: string | null;
  level: string;
  category: string;
  deadline: string;
  price: number;

  requirements: {
    id: string;
    text: string;
  }[];

  timelines: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
  }[];
};

export type CompetitionCardVM = {
  id: string;
  title: string;
  level: string;
  date: string;
  poster: string;
  closed: boolean;
};

export const createCompetition = async (data: CreateCompetitionPayload) => {
  const res = await api.post("/competitions", data);
  return res.data;
};

export const getCompetitions = async (params: CompetitionQuery) => {
  const res = await api.get("/competitions", { params });
  return res.data;
};

export const getCompetition = async (id: string): Promise<CompetitionDetail> => {
  const res = await api.get(`/competitions/${id}`);
  return res.data;
};

export const updateCompetition = async (id: string, data: CreateCompetitionPayload) => {
  const res = await api.put(`/competitions/${id}`, data);
  return res.data;
};

export const deleteCompetition = async (id: string) => {
  const res = await api.delete(`/competitions/${id}`);
  return res.data;
};

export const getCompetitionParticipants = async (id: string) => {
  const res = await api.get(`/competitions/${id}/participants`);
  return res.data;
};

export function toCompetitionCardVM(api: any): CompetitionCardVM {
  return {
    id: api.id,
    title: api.title,
    level: api.level,
    date: new Date(api.deadline).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    poster: api.poster || "/default-competition.png",
    closed: api.status === "closed",
  };
}