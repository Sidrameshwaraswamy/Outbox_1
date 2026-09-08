import React, { useState } from 'react';
import { LogOut, Bell, Menu, X } from 'lucide-react';
import { Button } from '../ui';
import { getInitials } from '../../utils/helpers';
import type { User } from '../../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onMenuToggle }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section - Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="text-sm font-semibold text-gray-500 hidden lg:block">Workspace inbox</div>
        </div>

        {/* Right Section - User Info & Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <img
                src={user.avatar || user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
            </button>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                <div className="p-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                <div className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:bg-red-50"
                    icon={<LogOut size={16} />}
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
