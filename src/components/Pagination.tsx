type Props = {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
};

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    const pages: (number | "...")[] = [];

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("...");
    }

    pages.push(...range(left, right));

    if (right < totalPages) {
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPages();

  return (
    <div className="pagination">
      <button className="nav" disabled={page === 1} onClick={() => onChange(page - 1)}>
        ‹
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={i} className="dots">
            ...
          </span>
        ) : (
          <button
            key={i}
            className={`page ${p === page ? "active" : ""}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button className="nav" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        ›
      </button>
    </div>
  );
}
