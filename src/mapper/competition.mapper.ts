import type { ExamStatus } from "../services/exam.service";

export type CompetitionCardVM = {
  id: string;
  title: string;
  level: string[];
  date: string;
  poster: string | null;
  closed: boolean;
  submitted: boolean;
  creationFile: string | null;
  examStatus: ExamStatus | null;
};

export type CompetitionListItemDTO = {
  id: string;
  title: string;
  category: string;
  level: string[];
  deadline: string;
  poster: string | null;
  participants: number;
  status: "open" | "closed";
  submitted: boolean;
  creationFile: string | null;
  examStatus: ExamStatus | null;
};

export function toCompetitionCardVM(api: CompetitionListItemDTO): CompetitionCardVM {
  return {
    id: api.id,
    title: api.title,
    level: Array.isArray(api.level) ? api.level : [api.level],
    date: new Date(api.deadline).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    // Diteruskan apa adanya (bisa null) - CompetitionCard.tsx sudah punya
    // fallback ke gambar lokal /default-poster.png sendiri. Jangan isi
    // fallback di sini: string apa pun akan dianggap "ada poster" oleh
    // pengecekan truthy di CompetitionCard, lalu salah diminta ke R2 lewat
    // /files/{key} - padahal bukan objek R2 (404 "File not found").
    poster: api.poster,
    closed: api.status === "closed",
    submitted: api.submitted,
    creationFile: api.creationFile,
    examStatus: api.examStatus,
  };
}
