import { useState } from "react";

export type CreationData = {
  name: string;
  competition: string;
  fileUrl: string;
};

export default function CreationModal({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: CreationData | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);

  if (!open || !data) return null;

  const isImage = data.fileUrl.match(/\.(jpg|jpeg|png)$/i);
  const isPDF = data.fileUrl.match(/\.pdf$/i);

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        setLoading(true);
        onClose();
      }}
    >
      <div className="modal large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          Karya Peserta
          <button
            onClick={() => {
              setLoading(true);
              onClose();
            }}
            className="btn-icon"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* <p>{<b>{data.name}</b>}</p>
          <p>{data.competition}</p> */}
          <div className="creation-info">
            <p>
              <b>{data.name}</b>
            </p>
            <p>{data.competition}</p>
          </div>

          {/* ===== SKELETON ===== */}
          {loading && (
            <div className="skeleton-preview">
              <div className="skeleton-box" />
            </div>
          )}

          {/* ===== IMAGE ===== */}
          {isImage && (
            <img
              src={data.fileUrl}
              alt="karya"
              style={{ width: "100%", display: loading ? "none" : "block" }}
              onLoad={() => setLoading(false)}
            />
          )}

          {/* ===== PDF ===== */}
          {isPDF && (
            <iframe
              src={data.fileUrl}
              width="100%"
              height="500px"
              title="PDF Preview"
              style={{ display: loading ? "none" : "block" }}
              onLoad={() => setLoading(false)}
            />
          )}

          {/* ===== OTHER FILE ===== */}
          {!isImage && !isPDF && (
            <a href={data.fileUrl} target="_blank" rel="noopener noreferrer">
              Download File
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
