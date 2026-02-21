type Props = {
  value: number;
  onChange: (v: number) => void;
  options?: number[];
};

export default function RowsPerPage({ value, onChange, options = [5, 10, 25, 50] }: Props) {
  return (
    <div className="rows-per-page">
      <span className="label">Rows per page:</span>

      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
