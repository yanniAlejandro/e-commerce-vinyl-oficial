interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = 'Cargando...' }: SpinnerProps) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
