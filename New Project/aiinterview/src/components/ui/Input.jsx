export function Input({ type, id, name, value, onChange }) {
    return (
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full p-2 border rounded"
      />
    );
  }
  