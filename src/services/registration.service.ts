import api from "../api/axios";

export type CreateRegistrationPayload = {
  phone: string;
  school: string;
  nisn: string;
  address: string;
  fileUrl: string;
  fileKey: string;
};

export const createRegistration = async (
  competitionId: string,
  payload: CreateRegistrationPayload
) => {
  const res = await api.post(`/registrations/${competitionId}`, payload);
  return res.data;
};
