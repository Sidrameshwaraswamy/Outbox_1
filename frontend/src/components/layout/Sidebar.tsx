import React from 'react';
import { Inbox, CalendarClock, CheckCircle2, Settings, Zap, Mail, X } from 'lucide-react';

interface SidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, badge: '12' },
  { id: 'scheduled', label: 'Scheduled', icon: CalendarClock, badge: null },
  { id: 'sent', label: 'Sent', icon: CheckCircle2, badge: null },
];

const manageItems = [
  { id: 'integrations', label: 'Integrations', icon: Zap },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavChange,
  isOpen = true,
  onClose,
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
          className={`fixed lg:relative w-64 h-screen bg-white text-gray-700 border-r border-gray-200 overflow-y-auto z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6">
          {/* Close Button Mobile */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Mail size={22} className="text-blue-600" />
              <span className="text-lg font-bold text-gray-900">ReachInbox</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-100 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Workspace Switcher */}
          <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs font-semibold text-gray-400 mb-1">WORKSPACE</p>
            <p className="font-medium text-gray-800">ReachInbox</p>
            <p className="text-xs text-gray-400">Default workspace</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 mb-8">
            <p className="text-xs font-semibold text-gray-400 px-3 mb-2">CHANNELS</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavChange(item.id);
                    onClose?.();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Manage Section */}
          <nav className="space-y-1 border-t border-gray-200 pt-6">
            <p className="text-xs font-semibold text-gray-400 px-3 mb-2">MANAGE</p>
            {manageItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavChange(item.id);
                    onClose?.();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-left">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-gray-400 mb-2">Plan usage</p>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium text-gray-800">Pro plan</p>
              <p className="text-xs text-gray-400">92%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">1,840 of 2,000 emails</p>
          </div>
        </div>
      </aside>
    </>
  );
};
