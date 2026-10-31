import type { Session } from "@supabase/supabase-js";
import { createContext, use, useEffect, useState, type PropsWithChildren } from "react";
import { supabase } from "./supabase";

type SessionState = { session: Session | null; isLoading: boolean; signOut: () => Promise<void> };

const SessionContext = createContext<SessionState | null>(null);

export function useSession() {
  const value = use(SessionContext);
  if (!value) throw new Error("useSession must be used within <SessionProvider>");
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <SessionContext value={{ session, isLoading, signOut: async () => void (await supabase.auth.signOut()) }}>
      {children}
    </SessionContext>
  );
}
