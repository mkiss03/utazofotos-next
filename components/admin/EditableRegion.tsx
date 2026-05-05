import type { ReactNode } from 'react';
import { isAdminViewer } from '@/lib/admin-viewer';
import { InlineEditWrapper } from './InlineEditWrapper';

/**
 * Szerveroldali wrapper — csak akkor renderel admin felületet, ha a
 * látogató be van jelentkezve. Ellenkező esetben pontosan a children
 * jelenik meg, semmi felesleges DOM nem kerül a publikus HTML-be.
 */
export async function EditableRegion({
  children,
  label,
  modalTitle,
  editor,
}: {
  children: ReactNode;
  label: string;
  modalTitle: string;
  editor: ReactNode;
}) {
  const isAdmin = await isAdminViewer();
  if (!isAdmin) return <>{children}</>;
  return (
    <InlineEditWrapper label={label} modalTitle={modalTitle} editor={editor}>
      {children}
    </InlineEditWrapper>
  );
}
