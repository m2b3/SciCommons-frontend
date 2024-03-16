// default required is true

const InputField = ({ id, name, type="text", value, onChange, label, error, characterCount, maxLength, required=true }) => {
    return (
      <div className="mb-6">
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-900">
          {label}
        </label>
        <input
          style={{ border: "2px solid #cbd5e0" }}
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
          required={required}
        />
        {error && <p className="text-red-500 text-xs italic">{error}</p>}
        {characterCount && (
          <span className="text-xs font-semibold">
            Number of characters: {value.length}/{maxLength}
          </span>
        )}
      </div>
    );
  };

export default InputField;