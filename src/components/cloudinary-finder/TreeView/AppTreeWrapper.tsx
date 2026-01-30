import { useState } from "react";

export default function AppTreeWrapper({
  appName,
  children,
}: {
  appName: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      {/* App root (UI only) */}
      <div
        className="flex items-center gap-1 px-2 py-1 cursor-pointer select-none font-medium"
        onClick={() => setOpen(v => !v)}
      >
        <span className="w-4 text-center">
          {open ? '▼' : '▶'}
        </span>
        <span>📦 {appName}</span>
      </div>

      {open && (
        <div className="ml-4">
          {children}
        </div>
      )}
    </div>
  );
}
