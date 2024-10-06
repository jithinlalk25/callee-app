import { create } from "zustand";
import { deleteSecureStoreData, setSecureStoreData } from "./secureStore";

interface StoreState {
  token: string | null;
  user: any;
  config: any;
  loading: boolean;
  snackbarText: string;
  setToken: (token: any) => void;
  setUser: (user: any) => void;
  setConfig: (config: any) => void;
  setLoading: (loading: boolean) => void;
  setSnackbarText: (snackbarText: string) => void;
  clearStore: () => void;
}

const useStore = create<StoreState>((set) => ({
  token: null,
  user: null,
  config: null,
  loading: false,
  snackbarText: "",
  setToken: async (token: string) => {
    set({ token });
    await setSecureStoreData("token", token);
  },
  setUser: (user: any) => set({ user }),
  setConfig: (config: any) => set({ config }),
  setLoading: (loading: any) => set({ loading }),
  setSnackbarText: (snackbarText: string) => set({ snackbarText }),
  clearStore: async () => {
    set({ token: null, user: null, config: null });
    await deleteSecureStoreData("token");
  },
}));

export default useStore;
