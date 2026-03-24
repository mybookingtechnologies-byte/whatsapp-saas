import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';

export function useGet(path: string, options?: any) {
  return useQuery({
    queryKey: [path],
    queryFn: async () => {
      const { data } = await api.get(path);
      return data;
    },
    ...options,
  });
}

export function usePost(path: string, options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const { data } = await api.post(path, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [path] });
    },
    ...options,
  });
}
