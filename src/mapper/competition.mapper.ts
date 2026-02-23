export type CompetitionCardVM = {
  id: string;
  title: string;
  level: string;
  date: string;
  poster: string;
  closed: boolean;
};

export function toCompetitionCardVM(api: any): CompetitionCardVM {
  return {
    id: api.id,
    title: api.title,
    level: api.level,
    date: new Date(api.deadline).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    poster: api.poster || "/default-competition.png",
    closed: api.status === "closed",
  };
}