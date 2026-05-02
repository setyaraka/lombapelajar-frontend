export type CompetitionDetailVM = {
  id: string;
  title: string;
  category: string;
  level: string;
  deadline: string;
  price: string;
  poster?: string | null;
  description: string;
  requirements: string[];
  juknis?: string;
  timeline: { title: string; date: string }[];
};

export type CompetitionRequirementDTO = {
  id: string;
  text: string;
};

export type CompetitionTimelineDTO = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
};

export type CompetitionDetailDTO = {
  id: string;
  title: string;
  description: string | null;
  poster: string | null;
  level: string;
  category: string;
  deadline: string;
  price: number;
  createdAt?: string;
  requirements: CompetitionRequirementDTO[];
  timelines: CompetitionTimelineDTO[];
  juknis?: string;
};

export function toCompetitionDetailVM(api: CompetitionDetailDTO): CompetitionDetailVM {
  return {
    id: api.id,
    title: api.title,
    category: api.category,
    level: api.level,
    deadline: formatDate(api.deadline),
    price: formatRupiah(api.price),
    poster: api.poster,
    description: api.description || "",
    juknis: api.juknis || "",

    requirements: api.requirements.map((r) => r.text),

    timeline: api.timelines.map((t) => ({
      title: t.title,
      date: `${formatDate(t.startDate)} - ${formatDate(t.endDate)}`,
    })),
  };
}
/* helpers */
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}
