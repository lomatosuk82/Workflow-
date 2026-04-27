import React from "react";

export function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <div className="text-base font-semibold text-slate-900">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-slate-500">{subtitle}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function SmallTag({ children }) {
  return <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">{children}</span>;
}
