import { Facebook } from 'lucide-react';

export const FB_URL = 'https://www.facebook.com/groups/702270205143442';
// TODO: TikTok URL-t hozzáadni, ha lesz – egyelőre kihagyva, hogy ne vezessen sehová.

export function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <a href={FB_URL} target="_blank" rel="noopener noreferrer">
          <Facebook size={14} aria-hidden="true" />
          <span>Facebook</span>
        </a>
      </div>
    </div>
  );
}
