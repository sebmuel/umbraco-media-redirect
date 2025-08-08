import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Config, Page } from "../types";

type ConfigStore = Config & {
  setActivated: (activated: boolean) => void;
  setPages: (pages: Page[] | ((pages: Page[]) => Page[])) => void;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
};

// Zustand expects StateStorage interface, so we wrap chrome.storage.local or fallback to localStorage
const getStorage = (): import("zustand/middleware").StateStorage => {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    return {
      getItem: (name) => {
        return new Promise((resolve) => {
          chrome.storage.local.get([name], (result) => {
            resolve(result[name] ? JSON.stringify(result[name]) : null);
          });
        });
      },
      setItem: (name, value) => {
        return new Promise((resolve) => {
          chrome.storage.local.set({ [name]: JSON.parse(value) }, () => {
            resolve(undefined);
          });
        });
      },
      removeItem: (name) => {
        return new Promise((resolve) => {
          chrome.storage.local.remove(name, () => {
            resolve(undefined);
          });
        });
      },
    };
  } else {
    // Fallback to localStorage for development
    return {
      getItem: (name) => Promise.resolve(localStorage.getItem(name)),
      setItem: (name, value) => {
        localStorage.setItem(name, value);
        return Promise.resolve(undefined);
      },
      removeItem: (name) => {
        localStorage.removeItem(name);
        return Promise.resolve(undefined);
      },
    };
  }
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      activated: false,
      currentTabUrl: "",
      pages: [],
      hydrated: false,
      setActivated: (activated) => set({ activated }),
      setPages: (pagesOrUpdater) =>
        set((state) => ({
          pages:
            typeof pagesOrUpdater === "function"
              ? (pagesOrUpdater as (pages: Page[]) => Page[])(state.pages)
              : pagesOrUpdater,
        })),
      setHydrated: (hydrated: boolean) => set({ hydrated }),
    }),
    {
      name: "config-storage",
      storage: createJSONStorage(getStorage),
      onRehydrateStorage: () => (state, error) => {
        console.log("Zustand hydration callback fired", { state, error });
        if (state) {
          if (error) {
            state.setActivated(false);
            state.setPages([]);
          }
          state.setHydrated(true);
        } else {
          // If state is undefined, manually set hydrated using a fallback
          setTimeout(() => {
            useConfigStore.getState().setHydrated(true);
          }, 0);
        }
      },
    }
  )
);
