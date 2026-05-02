import api from "../api/axios";

// export type CreateRegistrationPayload = {
//   phone: string;
//   school: string;
//   nisn: string;
//   address: string;
//   fileKey: string;
// };
export type CreateRegistrationPayload = {
  leader_name: string;
  members: string[];
  parent_name: string;
  fileKey: string;
};

export const createRegistration = async (
  competitionId: string,
  payload: CreateRegistrationPayload
) => {
  const res = await api.post(`/registrations/${competitionId}`, payload);
  return res.data;
};
