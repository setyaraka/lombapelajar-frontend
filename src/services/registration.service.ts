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

export const uploadCreation = async (registrationId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("registrationId", registrationId);

  const res = await api.post("/registrations/upload-creation", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
