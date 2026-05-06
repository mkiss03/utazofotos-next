import type { ReactNode } from 'react';
import { isAdminViewer } from '@/lib/admin-viewer';
import { EditableLink } from './EditableLink';

/**
 * Olyan szakaszhoz, amely admin felületre navigál (nem modális szerkesztő).
 * Pl. úticél kártyák, lábléc, médiatár ugrópont.
 */
export async function EditableLinkRegion({
  children,
  label,
  href,
}: {
  children: ReactNode;
  label: string;
  href: string;
}) {
  const isAdmin = await isAdminViewer();
  if (!isAdmin) return <>{children}</>;
  return (
    <EditableLink href={href} label={label}>
      {children}
    </EditableLink>
  );
}
