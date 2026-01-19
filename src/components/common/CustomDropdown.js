import { useState, useRef, useEffect } from "react";

export default function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  error
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="pd-select-wrap" ref={dropdownRef}>
      <div
        className={`profile-dropdown ${open ? "open" : ""} ${!value ? 'placeholder' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="pd-selected">
          {value || placeholder}
        </div>

        <span className="pd-caret">{open ? "▴" : "▾"}</span>
      </div>

      {open && (
        <div className="pd-options">
          {options.map((opt) => (
            <div
              key={opt.value || opt}
              className="pd-option"
              onClick={() => {
                onChange(opt.value || opt);
                setOpen(false);
              }}
            >
              {opt.label || opt}
            </div>
          ))}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
