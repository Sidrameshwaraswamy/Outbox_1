import React from 'react';
import { CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '../ui';
import { extractEmailAddress, formatDate } from '../../utils/helpers';
import type { Email } from '../../types';

interface EmailsTableProps {
  emails: Email[];
  loading: boolean;
  sent: boolean;
}

const statusConfig = {
  SENT: { label: 'Sent', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Clock },
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

export const EmailsTable: React.FC<EmailsTableProps> = ({ emails, loading, sent }) => {
  if (loading) {
    return <LoadingSpinner message="Loading emails..." />;
  }

  if (emails.length === 0) {
    return (
      <EmptyState
        title={`No ${sent ? 'sent' : 'scheduled'} emails yet`}
        description={
          sent
            ? 'Your sent conversations will appear here.'
            : 'Schedule your first email to see it here.'
        }
        icon={<FileText size={40} className="text-gray-300" />}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              <input type="checkbox" className="rounded" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Recipient
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              {sent ? 'Sent Date' : 'Scheduled For'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {emails.map((email) => {
            const config = statusConfig[email.status] || statusConfig.PENDING;
            const Icon = config.icon;
            const recipient = extractEmailAddress(email.recipient);

            return (
              <tr key={email.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-indigo-700">
                        {recipient[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{recipient}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 truncate max-w-xs">{email.subject}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(email.sentAt || email.scheduledAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${config.color}`}>
                    <Icon size={14} />
                    <span className="text-xs font-medium">{config.label}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <span className="text-lg">•••</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
