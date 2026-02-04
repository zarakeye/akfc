import { JSX, useState } from "react";

/**
 * A component that wraps the entire app tree and provides a toggle button to open or close it.
 * @param appName The name of the app to be displayed in the toggle button.
 * @param children The children of the component, which will be rendered only when the app tree is open.
 * @returns A JSX element that contains the toggle button and the app tree.
 */
export default function AppTreeWrapper({
  appName,
  children,
}: {
  appName: string;
  children: React.ReactNode;
}): JSX.Element {
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
