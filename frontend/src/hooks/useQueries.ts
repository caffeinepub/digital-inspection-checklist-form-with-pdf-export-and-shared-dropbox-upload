import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, UserRole, DropboxToken } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useAreAdminPrivilegesAvailable() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['adminPrivilegesAvailable'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.areAdminPrivilegesAvailable();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useClaimAdminPrivileges() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.claimAdminPrivileges();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['adminPrivilegesAvailable'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
    },
  });
}

export function useGetDropboxToken() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DropboxToken | null>({
    queryKey: ['dropboxToken'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDropboxToken();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useSetDropboxToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: DropboxToken) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setDropboxToken(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dropboxToken'] });
    },
  });
}

export function useDropboxConfiguration() {
  const { data: token, isLoading } = useGetDropboxToken();
  
  return {
    isConfigured: !!token,
    isLoading,
  };
}
