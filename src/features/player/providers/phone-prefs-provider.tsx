import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface PhonePrefsValue {
  /**
   * Show the question and the answer text on this phone as well as on the big
   * screen. Off by default — the big screen is the shared focus — but anyone
   * who cannot see it well, or is in another room, can turn it on for themselves.
   */
  showQuestion: boolean;
  setShowQuestion: (show: boolean) => void;
}

const STORAGE_KEY = 'ft:show-question';

const PhonePrefsContext = createContext<PhonePrefsValue | null>(null);

function readStored(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

interface PhonePrefsProviderProps {
  children: ReactNode;
  /**
   * Always show the question, whatever was stored. For a game with no big
   * screen — solo, or a duel — the phone is the only place it can be read.
   */
  alwaysShow?: boolean;
}

export function PhonePrefsProvider({ children, alwaysShow = false }: PhonePrefsProviderProps) {
  const [stored, setShow] = useState(readStored);
  const showQuestion = alwaysShow || stored;

  const setShowQuestion = useCallback((show: boolean) => {
    setShow(show);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(show));
    } catch {
      // The choice still applies for this visit.
    }
  }, []);

  const value = useMemo(() => ({ showQuestion, setShowQuestion }), [showQuestion, setShowQuestion]);

  return <PhonePrefsContext.Provider value={value}>{children}</PhonePrefsContext.Provider>;
}

export function usePhonePrefs(): PhonePrefsValue {
  const ctx = useContext(PhonePrefsContext);
  if (ctx === null) throw new Error('usePhonePrefs must be used inside PhonePrefsProvider');
  return ctx;
}
