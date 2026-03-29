import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
};

export default function LoadingButton({
  loading = false,
  loadingText = "Memproses...",
  children,
  className = "",
  disabled,
  ...props
}: Props) {
  return (
    <>
      <button
        {...props}
        disabled={loading || disabled}
        className={`lb-btn ${loading ? "loading" : ""} ${className}`}
      >
        {loading ? (
          <>
            <span className="lb-spinner" />
            {loadingText}
          </>
        ) : (
          children
        )}
      </button>

      {/* scoped style */}
      <style>{`
        .lb-btn {
          width: 100%;
          height: 46px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #2EC4B6, #3B82F6);
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .lb-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(124, 92, 244, 0.35);
        }

        .lb-btn:disabled,
        .lb-btn.loading {
          opacity: 0.8;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .lb-spinner {
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: lb-spin 0.7s linear infinite;
        }

        @keyframes lb-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
