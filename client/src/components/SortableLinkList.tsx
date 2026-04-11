import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Link, reorderLinks } from '../services/api';
import { EditLinkModal } from './EditLinkModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface SortableLinkListProps {
  links: Link[];
  onLinksChange: () => void;
}

interface SortableLinkProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
}

function SortableLink({ link, onEdit, onDelete }: SortableLinkProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="link-item">
      <div className="drag-handle" {...attributes} {...listeners}>
        <span>⋮⋮</span>
      </div>
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-card">
        {link.title}
      </a>
      <div className="link-actions">
        <button className="edit-btn" onClick={() => onEdit(link)} title="Editar">
          ✏️
        </button>
        <button className="delete-btn" onClick={() => onDelete(link)} title="Deletar">
          🗑️
        </button>
      </div>
    </div>
  );
}

export function SortableLinkList({ links, onLinksChange }: SortableLinkListProps) {
  const [items, setItems] = useState(links);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [deletingLink, setDeletingLink] = useState<Link | null>(null);

  useEffect(() => {
    setItems(links);
  }, [links]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      
      const orderedIds = newItems.map((item) => item.id);
      try {
        await reorderLinks(orderedIds);
        onLinksChange();
      } catch (error) {
        console.error('Erro ao reordenar links:', error);
      }
    }
  };

  const handleEditSuccess = () => {
    onLinksChange();
  };

  const handleDeleteSuccess = () => {
    onLinksChange();
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="sortable-list">
            {items.map((link) => (
              <SortableLink
                key={link.id}
                link={link}
                onEdit={setEditingLink}
                onDelete={setDeletingLink}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editingLink && (
        <EditLinkModal
          link={editingLink}
          isOpen={true}
          onClose={() => setEditingLink(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {deletingLink && (
        <DeleteConfirmModal
          linkId={deletingLink.id}
          linkTitle={deletingLink.title}
          isOpen={true}
          onClose={() => setDeletingLink(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}