import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAlerts,
  useCreateAlert,
  useResolveAlert,
  getGetAlertsQueryKey,
} from "@workspace/api-client-react";

export function useAlertsQuery() {
  return useGetAlerts();
}

export function useTriggerAlert() {
  const queryClient = useQueryClient();
  return useCreateAlert({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAlertsQueryKey() });
      },
    },
  });
}

export function useMarkAlertResolved() {
  const queryClient = useQueryClient();
  return useResolveAlert({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAlertsQueryKey() });
      },
    },
  });
}
