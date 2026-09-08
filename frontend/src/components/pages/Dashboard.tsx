import React, { useState, useEffect } from 'react';
import { Plus, Search, SlidersHorizontal, CalendarClock, CheckCircle2, Clock3 } from 'lucide-react';
import { Button } from '../ui';
import { EmailsTable } from '../emails/EmailsTable';
import { ComposeModal } from '../emails/ComposeModal';
import { StatsCard } from '../stats/StatsCard';
import { Header } from '../layout/Header';
import { Sidebar } from '../layout/Sidebar';
import { Toast } from '../ui/Toast';
import { apiClient } from '../../services/api';
import type { Email, User } from '../../types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeNav, setActiveNav] = useState('inbox');
  const [currentTab, setCurrentTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Update tab based on nav selection
  useEffect(() => {
    if (activeNav === 'scheduled') setCurrentTab('scheduled');
    if (activeNav === 'sent') setCurrentTab('sent');
  }, [activeNav]);

  // Load emails
  const loadEmails = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getEmails(
        currentTab === 'sent' ? 'SENT' : 'SCHEDULED',
        search
      );
      setEmails(response.emails || []);
    } catch (error) {
      setToast({
        message: 'Failed to load emails. Make sure the backend is running.',
        type: 'error',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      void loadEmails();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [currentTab, search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleScheduled = () => {
    setComposeOpen(false);
    setToast({
      message: 'Emails scheduled successfully!',
      type: 'success',
    });
    void loadEmails();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          user={user}
          onLogout={onLogout}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">DELIVERY CENTER</div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Good morning, {user.name.split(' ')[0] || 'User'}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Keep an eye on every conversation, before it leaves your inbox.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Plus size={18} />}
                  onClick={() => setComposeOpen(true)}
                >
                  Compose new email
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                  icon={<CalendarClock size={24} />}
                  label="Scheduled"
                  value="24"
                  detail="next 7 days"
                  tone="blue"
                />
                <StatsCard
                  icon={<CheckCircle2 size={24} />}
                  label="Sent this month"
                  value="1,284"
                  detail="↑ 18.4% vs last month"
                  tone="green"
                />
                <StatsCard
                  icon={<Clock3 size={24} />}
                  label="Avg. response"
                  value="2.8h"
                  detail="↓ 12 min vs last month"
                  tone="orange"
                />
              </div>
            </div>

            {/* Emails Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Section Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentTab('scheduled')}
                    className={`pb-2 px-4 border-b-2 font-medium transition ${
                      currentTab === 'scheduled'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Scheduled <span className="text-xs ml-1 text-gray-500">(24)</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('sent')}
                    className={`pb-2 px-4 border-b-2 font-medium transition ${
                      currentTab === 'sent'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Sent <span className="text-xs ml-1 text-gray-500">(1,284)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" icon={<Search size={16} />}>
                    Search
                  </Button>
                  <Button variant="secondary" size="sm" icon={<SlidersHorizontal size={16} />}>
                    Filter
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="px-6 py-4 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search recipient or subject..."
                  value={search}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <EmailsTable emails={emails} loading={loading} sent={currentTab === 'sent'} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Compose Modal */}
      <ComposeModal isOpen={composeOpen} onClose={() => setComposeOpen(false)} onScheduled={handleScheduled} />

      {/* Toast Notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
            duration={5000}
          />
        </div>
      )}
    </div>
  );
};
