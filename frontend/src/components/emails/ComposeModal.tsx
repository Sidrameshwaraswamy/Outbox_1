import React, { useState, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Modal, Button, Input } from '../ui';
import { parseEmailsFromText } from '../../utils/helpers';
import { apiClient } from '../../services/api';
import type { ScheduleEmailRequest } from '../../types';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, onScheduled }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(
    new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );
  const [delay, setDelay] = useState('2000');
  const [hourlyLimit, setHourlyLimit] = useState('100');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      const emails = parseEmailsFromText(text);
      if (emails.length === 0) {
        setError('No valid email addresses found in the file.');
        return;
      }
      setRecipients(emails);
      setError(null);
    } catch (err) {
      setError('Failed to read file. Please try a different file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!subject.trim()) {
      setError('Please enter a subject.');
      return;
    }
    if (!body.trim()) {
      setError('Please enter the email body.');
      return;
    }
    if (recipients.length === 0) {
      setError('Please upload a file with at least one email address.');
      return;
    }

    try {
      setIsLoading(true);

      const payload: ScheduleEmailRequest = {
        subject,
        body,
        recipients,
        startTime,
        delayBetweenMs: Number(delay),
        hourlyLimit: Number(hourlyLimit),
      };

      await apiClient.scheduleEmails(payload);
      onScheduled();
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to schedule emails. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSubject('');
    setBody('');
    setRecipients([]);
    setStartTime(new Date(Date.now() + 3600000).toISOString().slice(0, 16));
    setDelay('2000');
    setHourlyLimit('100');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Compose Email Sequence"
      description="Schedule emails to be sent to your leads"
      onClose={handleClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Subject */}
        <Input
          label="Subject"
          placeholder="A thoughtful subject line"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Body
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your email here..."
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lead List
            <span className="text-indigo-600 font-semibold ml-2">
              {recipients.length} addresses detected
            </span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition"
          >
            <Upload size={24} className="text-gray-400" />
            <div>
              <p className="font-medium text-gray-700">Upload a CSV or text file</p>
              <p className="text-sm text-gray-600">We'll find every email address automatically</p>
            </div>
          </button>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Delay Between Emails */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delay Between Emails
            </label>
            <select
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="1000">1 second</option>
              <option value="2000">2 seconds</option>
              <option value="5000">5 seconds</option>
              <option value="10000">10 seconds</option>
              <option value="30000">30 seconds</option>
              <option value="60000">1 minute</option>
            </select>
          </div>

          {/* Hourly Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Limit
            </label>
            <input
              type="number"
              min="1"
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" size="md" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={isLoading || recipients.length === 0}
            className="flex-1"
          >
            Schedule Emails
          </Button>
        </div>
      </form>
    </Modal>
  );
};
