import {
  useRef,
  useCallback,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const createFastStore = <Store,>(initialState: Store, key?: string) => {
  const useStoreData = (): {
    get: () => Store;
    set: (data: Partial<Store>) => void;
    subscribe: (callback: () => void) => () => void;
    reset: () => void;
  } => {
    let storage: Store = initialState;
    if (key && typeof window !== "undefined" && localStorage.getItem(key)) {
      storage = JSON.parse(localStorage.getItem(key) || "");
    }
    const store = useRef(storage);
    const get = useCallback(() => store.current, []);
    const subscribers = useRef(new Set<() => void>());
    const set = useCallback((data: Partial<Store>) => {
      store.current = { ...store.current, ...data };
      localStorage.setItem(key || "", JSON.stringify(store.current));
      subscribers.current?.forEach((callback) => callback());
    }, []);

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    const reset = useCallback(() => {
      store.current = initialState;
      subscribers.current?.forEach((callback) => callback());
      localStorage.removeItem(key || "");
    }, []);

    return { get, set, subscribe, reset };
  };
  type UseStoreDataReturnType = ReturnType<typeof useStoreData>;
  const StoreContext = createContext<UseStoreDataReturnType | null>(null);
  function Provider({ children }: { children: React.ReactNode }) {
    return (
      <StoreContext.Provider value={useStoreData()}>
        {children}
      </StoreContext.Provider>
    );
  }
  const useStore = <SelectorOutput,>(
    selector: (store: Store) => SelectorOutput
  ): [SelectorOutput, (args: Partial<Store>) => void, () => void] => {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error("useStore must be used within a StoreProvider");
    }
    const [state, setState] = useState(selector(store.get()));

    useEffect(() => {
      const unsubscribe = store.subscribe(() =>
        setState(selector(store.get()))
      );
      return unsubscribe;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [state, store.set, store.reset];
  };
  const useStoreReset = () => {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error("useStore must be used within a StoreProvider");
    }
    return store.reset;
  };

  return { Provider, useStore, useStoreReset };
};
export default createFastStore;
