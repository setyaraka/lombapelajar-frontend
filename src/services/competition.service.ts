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

export const createCompetition = async (data: CreateCompetitionPayload) => {
  const res = await api.post("/competitions", data);
  return res.data;
};
