import { create } from 'zustand'

type JournalStore = {
  journalType: string
  setJournalType: (type: string) => void
}

export const useJournalStore = create<JournalStore>((set) => ({
  journalType: 'business',
  setJournalType: (type) => set({ journalType: type }),
})) 