import { useQueryClient } from "@tanstack/react-query";
import {
  useGetTodayLogs,
  useMarkReminderTaken,
  getGetTodayLogsQueryKey,
  getGetRemindersQueryKey,
} from "@workspace/api-client-react";

export function useTodayLogsQuery() {
  return useGetTodayLogs();
}

export function useMarkTaken() {
  const queryClient = useQueryClient();
  return useMarkReminderTaken({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTodayLogsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRemindersQueryKey() });
      },
    },
  });
}
