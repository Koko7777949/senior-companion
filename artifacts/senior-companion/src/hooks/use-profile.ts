import { useQueryClient } from "@tanstack/react-query";
import {
  useGetProfile,
  useUpdateProfile,
  getGetProfileQueryKey,
} from "@workspace/api-client-react";

export function useProfileQuery() {
  return useGetProfile();
}

export function useEditProfile() {
  const queryClient = useQueryClient();
  return useUpdateProfile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      },
    },
  });
}
