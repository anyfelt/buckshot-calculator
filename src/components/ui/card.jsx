export function Card({ children, className = "" }) {
  return (
    <div className={`border rounded shadow p-4 bg-white ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
}
