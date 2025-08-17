export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center px-4 py-2 text-sm font-medium bg-black text-white rounded hover:bg-gray-800 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
