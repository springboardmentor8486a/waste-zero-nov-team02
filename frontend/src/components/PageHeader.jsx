import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PageHeader({ title, subtitle, dropdownContent }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-white/80">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3" ref={ref}>

        {/* three-dots menu */}
        <div className="relative">
          <button
            aria-label="More"
            onClick={() => setOpen((s) => !s)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white border rounded shadow-md z-20">
              {dropdownContent ? (
                typeof dropdownContent === 'function' ? (
                  dropdownContent(() => setOpen(false))
                ) : (
                  <div className="p-2">{dropdownContent}</div>
                )
              ) : (
                <div>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/messages");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    History
                  </button>

                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/messages");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    Messages
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
