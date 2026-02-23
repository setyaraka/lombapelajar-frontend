import api from "../api/axios";

export const getParticipants = async (params: {
  page: number;
  perPage: number;
  search: string;
  status: string;
}) => {
  const res = await api.get("/admin/registrations", { params });
  return res.data;
};

export const updateParticipantStatus = async (id: string, status: string) => {
  await api.patch(`/admin/participants/${id}/status`, { status });
};
