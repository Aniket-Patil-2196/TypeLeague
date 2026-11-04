import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BookOpen } from 'lucide-react';

export const SharedLibraryModal = ({
  isOpen,
  onClose,
  groupId,
  onImportSuccess,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState(null);
  const [selectedPassage, setSelectedPassage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchShared();
    }
  }, [isOpen]);

  const fetchShared = async () => {
    setLoading(true);
    try {
      const res = await api.get('/content/shared');
      setItems(res.data.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (passage) => {
    setImportingId(passage._id);
    try {
      await api.post('/content', {
        title: passage.title,
        description: passage.description,
        passageText: passage.passageText,
        category: passage.category,
        difficulty: passage.difficulty,
        scope: 'group',
        groupId,
        status: 'Published',
      });
      onImportSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to import passage.');
    } finally {
      setImportingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SHARED PLATFORM REPOSITORY"
      indexLabel="[REPO_SHARED]"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        <p className="text-xs text-ink-soft leading-relaxed">
          Select verified content curated by TypeLeague administrators. Importing creates an independent
          snapshot in your clan library for daily challenges.
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="h-20" width="w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="NO SHARED PASSAGES"
            description="The global repository is currently synchronizing."
          />
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item._id}
                className="border border-line bg-surface p-4 flex flex-col justify-between hover:border-ink transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="neutral" size="sm">{item.category}</Badge>
                      <Badge variant="outline" size="sm">{item.difficulty}</Badge>
                    </div>
                    <h4 className="text-xs uppercase font-bold text-ink">{item.title}</h4>
                    <p className="text-[11px] text-ink-soft mt-0.5 line-clamp-1">{item.description}</p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    loading={importingId === item._id}
                    onClick={() => handleImport(item)}
                  >
                    IMPORT TO CLAN
                  </Button>
                </div>

                <div className="border-t border-line pt-2 text-[10px] text-ink-muted flex items-center justify-between tabular-nums">
                  <span>{item.wordCount} WORDS &middot; {item.charCount} CHARS</span>
                  <span>EST. {item.estimatedDuration}S</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-line">
          <Button variant="secondary" size="sm" onClick={onClose}>
            CLOSE
          </Button>
        </div>
      </div>
    </Modal>
  );
};
