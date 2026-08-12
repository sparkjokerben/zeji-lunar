/** 生辰设置状态：zustand + persist(localStorage)；云端同步由设置页显式触发 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '@zeji/shared';

interface ProfileState extends Profile {
  setProfile: (p: Profile) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      birthDate: '',
      birthHour: null,
      setProfile: (p) => set({ birthDate: p.birthDate, birthHour: p.birthHour }),
    }),
    {
      name: 'zeji-profile',
    },
  ),
);
