import { useEffect, useRef } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

/**
 * Subscribes to Postgres changes on a given table via Supabase Realtime.
 * Optionally filters by a column (e.g. customer_id=eq.<id>).
 */
export function useRealtimeTable<T extends object>(
  table: string,
  onChange: (payload: RealtimePostgresChangesPayload<T>) => void,
  filter?: string
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}:${filter ?? 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        (payload) =>
          onChangeRef.current(
            payload as unknown as RealtimePostgresChangesPayload<T>
          )
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter]);
}
