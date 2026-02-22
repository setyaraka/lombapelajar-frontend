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

export const createCompetition = async (data: CreateCompetitionPayload) => {
  const res = await api.post("/competitions", data);
  return res.data;
};

export const getCompetitions = async (params: CompetitionQuery) => {
  const res = await api.get("/competitions", { params });
  return res.data;
};