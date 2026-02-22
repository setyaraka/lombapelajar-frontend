import api from "../api/axios";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  birthDate: string;
  school: string;
};

export const register = async (data: RegisterPayload) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};
