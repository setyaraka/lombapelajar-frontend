export type CompetitionCardVM = {
  id: string;
  title: string;
  level: string;
  date: string;
  poster: string;
  closed: boolean;
  submitted: boolean;
};

export type CompetitionListItemDTO = {
  id: string;
  title: string;
  category: string;
  level: string;
  deadline: string;
  poster: string | null;
  participants: number;
  status: "open" | "closed";
  registrations?: { id: string }[];
};

export function toCompetitionCardVM(api: CompetitionListItemDTO): CompetitionCardVM {
  return {
    id: api.id,
    title: api.title,
    level: api.level,
    date: new Date(api.deadline).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    poster: api.poster ?? "/default-competition.png",
    closed: api.status === "closed",
    submitted: (api.registrations?.length ?? 0) > 0,
  };
}
