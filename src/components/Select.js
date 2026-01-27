export function Select({ className, options, onChange }) {
  return (
    <>
      <select onChange={onChange} className={className}>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  );
}
