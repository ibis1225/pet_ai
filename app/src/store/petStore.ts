import { create } from 'zustand';
import { Pet } from '../types';
import { petApi } from '../lib/api';

interface PetStore {
  pets: Pet[];
  selectedPet: Pet | null;
  isLoading: boolean;

  loadPets: () => Promise<void>;
  selectPet: (pet: Pet | null) => void;
  addPet: (data: Partial<Pet>) => Promise<void>;
  updatePet: (id: string, data: Partial<Pet>) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
}

export const usePetStore = create<PetStore>((set, get) => ({
  pets: [],
  selectedPet: null,
  isLoading: false,

  loadPets: async () => {
    set({ isLoading: true });
    try {
      const response = await petApi.list();
      set({ pets: response.data.items || response.data });
    } finally {
      set({ isLoading: false });
    }
  },

  selectPet: (pet) => set({ selectedPet: pet }),

  addPet: async (data) => {
    const response = await petApi.create(data);
    set({ pets: [...get().pets, response.data] });
  },

  updatePet: async (id, data) => {
    const response = await petApi.update(id, data);
    set({
      pets: get().pets.map((p) => (p.id === id ? response.data : p)),
    });
  },

  deletePet: async (id) => {
    await petApi.delete(id);
    set({ pets: get().pets.filter((p) => p.id !== id) });
  },
}));
