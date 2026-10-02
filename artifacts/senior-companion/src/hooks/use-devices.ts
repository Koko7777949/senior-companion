import { useQueryClient } from "@tanstack/react-query";
import {
  useGetDevices,
  useCreateDevice,
  useDeleteDevice,
  useGetDeviceReadings,
  getGetDevicesQueryKey,
} from "@workspace/api-client-react";

export function useDevicesQuery() {
  return useGetDevices();
}

export function useAddDevice() {
  const queryClient = useQueryClient();
  return useCreateDevice({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDevicesQueryKey() });
      },
    },
  });
}

export function useRemoveDevice() {
  const queryClient = useQueryClient();
  return useDeleteDevice({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDevicesQueryKey() });
      },
    },
  });
}

export function useDeviceReadingsQuery(deviceId: number | null) {
  return useGetDeviceReadings(deviceId as number, {
    query: {
      enabled: !!deviceId,
    }
  });
}
