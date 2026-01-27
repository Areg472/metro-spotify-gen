export function Select({
  className,
  options,
  onChange,
  optionClassName,
  placeholder,
}) {
  return (
    <>
      <select onChange={onChange} className={className}>
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
