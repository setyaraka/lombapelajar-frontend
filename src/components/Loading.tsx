type LoadingProps = {
  fullScreen?: boolean;
  text?: string;
};

export default function Loading({ fullScreen = false, text }: LoadingProps) {
  return (
    <div className={fullScreen ? "loading full" : "loading"}>
      <div className="spinner" />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}
