import { useQueryClient } from "@tanstack/react-query";
import {
  useGetReminders,
  useCreateReminder,
  useUpdateReminder,
  useDeleteReminder,
  getGetRemindersQueryKey,
} from "@workspace/api-client-react";

export function useRemindersQuery() {
  return useGetReminders();
}

export function useAddReminder() {
  const queryClient = useQueryClient();
  return useCreateReminder({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRemindersQueryKey() });
      },
    },
  });
}

export function useEditReminder() {
  const queryClient = useQueryClient();
  return useUpdateReminder({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRemindersQueryKey() });
      },
    },
  });
}

export function useRemoveReminder() {
  const queryClient = useQueryClient();
  return useDeleteReminder({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRemindersQueryKey() });
      },
    },
  });
}
