import api from "../api/axios";

export const uploadPaymentProof = async (registrationId: string, file: File) => {
  const fd = new FormData();
  fd.append("file", file);

  const res = await api.post(`/payments/${registrationId}/upload`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
