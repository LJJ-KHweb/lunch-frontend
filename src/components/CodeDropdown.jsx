import { useEffect, useRef, useState } from "react";

export default function CodeDropdown({ codes, value, onChange, placeholder = "코드 선택" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dropdown" ref={rootRef}>
      <button
        type="button"
        className={`dropdown-trigger${open ? " open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={value ? "" : "dropdown-placeholder"}>{value || placeholder}</span>
        <span className="dropdown-arrow">▾</span>
      </button>

      {open && (
        <ul className="dropdown-menu">
          {codes.length === 0 && <li className="dropdown-empty">발급된 코드가 없습니다</li>}
          {codes.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`dropdown-item${value === c.code ? " active" : ""}`}
                onClick={() => {
                  onChange(c.code);
                  setOpen(false);
                }}
              >
                {c.code}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
