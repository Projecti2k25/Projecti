export function Label({ htmlFor, children }) {
    return <label htmlFor={htmlFor} className="block font-medium">{children}</label>;
  }
  