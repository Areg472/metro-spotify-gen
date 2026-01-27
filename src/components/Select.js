export function Select({ className, options, onChange }) {
  return (
    <>
      <select onChange={onChange} className={className}>
        <option value="">Select a station</option>
        {options.map((option, index) => (
          <option key={index} value={option.name}>
            {option.name}
          </option>
        ))}
      </select>
    </>
  );
}
