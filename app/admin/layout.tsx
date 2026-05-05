/**
 * Admin gyökér layout — egyszerű passthrough.
 * A login és a védett rész külön sublayoutokat használ.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-root">{children}</div>;
}
