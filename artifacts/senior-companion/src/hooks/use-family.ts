import { useQueryClient } from "@tanstack/react-query";
import {
  useGetFamilyContacts,
  useCreateFamilyContact,
  useDeleteFamilyContact,
  getGetFamilyContactsQueryKey,
} from "@workspace/api-client-react";

export function useFamilyQuery() {
  return useGetFamilyContacts();
}

export function useAddFamilyContact() {
  const queryClient = useQueryClient();
  return useCreateFamilyContact({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetFamilyContactsQueryKey() });
      },
    },
  });
}

export function useRemoveFamilyContact() {
  const queryClient = useQueryClient();
  return useDeleteFamilyContact({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetFamilyContactsQueryKey() });
      },
    },
  });
}
