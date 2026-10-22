import {
  Bookmark,
  Contact,
  Pencil,
  Plus,
  StickyNote,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import type { ChangeAction, RecordCategory } from '../../types'

export const categoryMeta: Record<
  RecordCategory,
  { label: string; plural: string; icon: LucideIcon; tile: string; badge: string }
> = {
  note: {
    label: 'Note',
    plural: 'Notes',
    icon: StickyNote,
    tile: 'bg-brand-soft text-brand',
    badge: 'border-brand/10 bg-brand-soft text-brand-dark',
  },
  contact: {
    label: 'Contact',
    plural: 'Contacts',
    icon: Contact,
    tile: 'bg-[#eef2fb] text-[#4169a8]',
    badge: 'border-[#4169a8]/10 bg-[#eef2fb] text-[#4169a8]',
  },
  resource: {
    label: 'Resource',
    plural: 'Resources',
    icon: Bookmark,
    tile: 'bg-lime-soft text-[#5a7a20]',
    badge: 'border-[#7a9a35]/10 bg-lime-soft text-[#5a7a20]',
  },
}

export const changeMeta: Record<
  ChangeAction,
  { label: string; icon: LucideIcon; tile: string; badge: string }
> = {
  create: {
    label: 'New',
    icon: Plus,
    tile: 'bg-brand-soft text-brand',
    badge: 'border-brand/10 bg-brand-soft text-brand-dark',
  },
  update: {
    label: 'Edited',
    icon: Pencil,
    tile: 'bg-[#eef2fb] text-[#4169a8]',
    badge: 'border-[#4169a8]/10 bg-[#eef2fb] text-[#4169a8]',
  },
  delete: {
    label: 'Deleted',
    icon: Trash2,
    tile: 'bg-[#fbeceb] text-[#b4544e]',
    badge: 'border-[#b4544e]/10 bg-[#fbeceb] text-[#b4544e]',
  },
}
