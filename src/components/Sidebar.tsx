import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import FallBackThumb from '@/assets/fallbackthumbnail.webp'

interface Page {
  id: string;
  name: string;
  thumbnail: string;
  content: string;
}

interface SidebarProps {
  currentPage: Page | null;
  pages: Page[];
  onPageSelect: (page: Page) => void;
  onPageCreate: (name: string) => void;
}

export function Sidebar({ currentPage, pages, onPageSelect, onPageCreate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');

  const handleNewPage = () => {
    if (newPageName.trim()) {
      onPageCreate(newPageName.trim());
      setNewPageName('');
      setIsNewPageModalOpen(false);
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-64'} z-50`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-gray-900 p-1 rounded-full"
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className="p-4 h-full flex flex-col">
        {!isCollapsed && (
          <Button
            onClick={() => setIsNewPageModalOpen(true)}
            className="w-full mb-4 flex items-center gap-2"
          >
            <Plus size={16} />
            New Page
          </Button>
        )}

        <div className="space-y-4 overflow-y-auto flex-1">
          {pages.map((page) => (
            <div
              key={page.id}
              onClick={() => onPageSelect(page)}
              className={`cursor-pointer rounded-lg p-2 transition-colors ${currentPage?.id === page.id ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
            >
              {!isCollapsed && (
                <>
                  <div className="mb-2 text-sm font-medium truncate">{page.name}</div>
                  <div className="relative aspect-video w-full overflow-hidden rounded border border-gray-700">
                    <img
                      src={page.thumbnail || FallBackThumb}
                      alt={`${page.name} thumbnail`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isNewPageModalOpen} onOpenChange={setIsNewPageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              placeholder="Enter page name"
              onKeyDown={(e) => e.key === 'Enter' && handleNewPage()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPageModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewPage}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}