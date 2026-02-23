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
  timeline: { title: string; date: string }[];
};

export function toCompetitionDetailVM(api: any): CompetitionDetailVM {
  return {
    id: api.id,
    title: api.title,
    category: api.category,
    level: api.level,
    deadline: formatDate(api.deadline),
    price: formatRupiah(api.price),
    poster: api.poster,
    description: api.description,

    requirements: api.requirements.map((r: any) => r.text),

    timeline: api.timelines.map((t: any) => ({
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