export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2 border rounded text-sm ${className}`}
      {...props}
    />
  );
}
