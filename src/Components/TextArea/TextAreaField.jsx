const TextareaField = ({ id, name, value, onChange, label, characterCount }) => {
    return (
      <div className="mb-6">
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-900">
          {label}
        </label>
        <textarea
          id={id}
          name={name}
          rows={8}
          value={value}
          onChange={onChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
          required
        />
        {characterCount && (
          <span className="text-xs font-semibold">
            Number of characters: {value.length}
          </span>
        )}
      </div>
    );
  };

  export default TextareaField;