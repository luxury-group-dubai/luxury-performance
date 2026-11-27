export function ActionLabel({ children }: { children: string }) {
  return <span className="action-label">
    <span>{children}</span>
    <span aria-hidden="true">{children}</span>
  </span>;
}
