// useUsersData.ts
"use client";
import { useState, useEffect, useRef } from 'react';
import { useMutationHook } from './useMutationHook';
import { allUsersApi, blockUnblockUserApi } from '@/apis/adminApi';
import { debounce } from 'lodash';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/userStore';
import { useSocket } from '@/context/SocketContext';

export interface IUserData {
  name: string;
  email: string;
  isAdmin: boolean;
  isBlocked: boolean;
  id: string;
  avatarUrl: string;
}
export const useUsersData = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<IUserData[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [searchKeyword, _setSearchKeyword] = useState("")
  const usersPerPage = "10";
  const user = useUserStore((state) => state.user)
  const { socket, isConnected } = useSocket()

  const searchRef = useRef(searchKeyword);

  const { mutate: getUsers, isLoading: isUsersLoading } = useMutationHook(allUsersApi, {
    onSuccess(response) {
      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
    }
  });

  const { mutate: updateBlockStatus } = useMutationHook(blockUnblockUserApi, {
    onSuccess(data, variable) {
      getUsers({
        limit: usersPerPage,
        page: 1,
        status: filterStatus,
      });
      if (!user || !socket || !isConnected) {
        console.log(`Socket not ready or user missing user: ${user}, socket: ${socket}`);
        return;
      }

      socket.emit("block-user", { userId: variable.userId })
    }
  })

  const handleBlockUnblockUser = (userId: string, status: "suspend" | "active") => {
    updateBlockStatus({ userId, status })
  }

  const debouncedFetch = useRef(
    debounce((search: string) => {
      getUsers({
        limit: usersPerPage,
        page: 1,
        status: filterStatus,
        search,
      });
    }, 1000)
  );

  useEffect(() => {
    debouncedFetch.current = debounce((search: string) => {
      getUsers({
        limit: usersPerPage,
        page: 1,
        status: filterStatus,
        search,
      });
    }, 1000);
  }, [filterStatus]);

  useEffect(() => {
    return () => {
      debouncedFetch.current.cancel();
    };
  }, []);

  const setSearchKeyword = (value: string) => {
    searchRef.current = value;
    _setSearchKeyword(value);
    debouncedFetch.current(value);
  };


  useEffect(() => {
    getUsers({
      limit: usersPerPage,
      page: currentPage,
      status: filterStatus,
      search: searchRef.current,
    });
  }, [currentPage, filterStatus]);

  return {
    users,
    currentUsers: users,
    currentPage,
    setCurrentPage,
    totalPages,
    setFilterStatus,
    setSearchKeyword,
    handleBlockUnblockUser,
    isUsersLoading
  };
};
