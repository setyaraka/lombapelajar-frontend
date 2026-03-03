import axios from "axios";

interface ErrorResponse {
  message?: string;
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError<ErrorResponse>(err)) {
    return err.response?.data?.message || err.message;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Terjadi kesalahan";
}
