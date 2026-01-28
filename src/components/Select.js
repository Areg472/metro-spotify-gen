export function Select({
  className,
  options,
  onChange,
  optionClassName,
  placeholder,
  value,
}) {
  return (
    <>
      <select onChange={onChange} className={className} value={value}>
        <option value="" disabled>
          {placeholder || "Select a station"}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.name} className={optionClassName}>
            {option.name}
          </option>
        ))}
      </select>
    </>
  );
}
