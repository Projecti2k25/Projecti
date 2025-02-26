export function Button({ children, onClick, type = "button" }) {
    return (
      <button type={type} onClick={onClick} className="p-2 bg-blue-500 text-white rounded w-full">
        {children}
      </button>
    );
  }
  