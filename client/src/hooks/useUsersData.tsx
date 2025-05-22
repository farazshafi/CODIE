// useUsersData.ts
"use client";
import { useState, useEffect } from 'react';

export const useUsersData = () => {
  const [activeTab, setActiveTab] = useState<'All Users' | 'Suspended' | 'pro users'>('All Users');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const usersPerPage = 5;

  const mockUsers = [
    { id: '#3041', name: 'Faraz shafi', plan: 'pro', status: 'Active' },
    { id: '#3042', name: 'Mohammed sawad', plan: 'Standard', status: 'Suspended' },
    { id: '#3043', name: 'Mohammed sawad', plan: 'Standard', status: 'Suspended' },
    { id: '#3044', name: 'Emily Johnson', plan: 'pro', status: 'Active' },
    { id: '#3045', name: 'Alex Wong', plan: 'Standard', status: 'Active' },
    { id: '#3046', name: 'Sarah Miller', plan: 'pro', status: 'Suspended' },
    { id: '#3047', name: 'James Brown', plan: 'Standard', status: 'Active' },
    { id: '#3048', name: 'Sophia Garcia', plan: 'pro', status: 'Active' },
    { id: '#3049', name: 'Michael Davis', plan: 'Standard', status: 'Suspended' },
    { id: '#3050', name: 'Olivia Wilson', plan: 'pro', status: 'Active' },
  ];


  const filteredUsers = mockUsers.filter(user => {
    if (activeTab === 'Suspended' && user.status !== 'Suspended') return false;
    if (activeTab === 'pro users' && user.plan.toLowerCase() !== 'pro') return false;
    if (selectedStatus && user.status !== selectedStatus) return false;
    if (selectedPlan && user.plan.toLowerCase() !== selectedPlan.toLowerCase()) return false;
    return true;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedStatus, selectedPlan]);

  const clearFilters = () => {
    setSelectedStatus(null);
    setSelectedPlan(null);
  };

  return {
    users: mockUsers,
    filteredUsers,
    currentUsers,
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    totalPages,
    selectedStatus,
    setSelectedStatus,
    selectedPlan,
    setSelectedPlan,
    clearFilters,
  };
};
