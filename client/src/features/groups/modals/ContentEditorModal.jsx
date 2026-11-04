import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea, Select } from '../../../components/ui/Input';

export const ContentEditorModal = ({
  isOpen,
  onClose,
  groupId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    passageText: '',
    category: 'Technology',
    difficulty: 'Medium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Counters
  const charCount = formData.passageText.length;
  const wordCount = formData.passageText.trim() ? formData.passageText.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.max(Math.round((wordCount / 40) * 60), 30);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.passageText.trim().length < 20) {
      setError('Passage text must be at least 20 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/content', {
        ...formData,
        scope: 'group',
        groupId,
        status: 'Published',
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save passage.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DISTRACTION-FREE PASSAGE EDITOR"
      indexLabel="[EDITOR_01]"
      maxWidth="max-w-2xl"
    >
      {error && (
        <div className="mb-4 p-3 bg-surface border border-error text-error text-xs uppercase tracking-wide">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Passage Title"
          name="title"
          required
          placeholder="e.g. Memory Allocation and Pointers"
          value={formData.title}
          onChange={handleChange}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="Technology">TECHNOLOGY</option>
            <option value="Programming">PROGRAMMING</option>
            <option value="Science">SCIENCE</option>
            <option value="Literature">LITERATURE</option>
            <option value="General Knowledge">GENERAL KNOWLEDGE</option>
            <option value="Business">BUSINESS</option>
            <option value="History">HISTORY</option>
          </Select>

          <Select
            label="Difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="Easy">EASY</option>
            <option value="Medium">MEDIUM</option>
            <option value="Hard">HARD</option>
          </Select>
        </div>

        {/* Square Distraction-Free Editor Textarea */}
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
            Passage Text (Min 20, Max 5000 chars) <span className="text-accent">*</span>
          </label>
          <textarea
            name="passageText"
            required
            rows={8}
            placeholder="Write or paste pure typing content here..."
            value={formData.passageText}
            onChange={handleChange}
            disabled={loading}
            className="w-full p-4 bg-surface text-ink text-sm font-mono placeholder:text-ink-muted border border-line focus:border-ink resize-y leading-relaxed"
          />

          {/* Telemetry Counter Bar in Label Type */}
          <div className="border border-line bg-surface px-3 py-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-ink-muted tabular-nums">
            <span>CHARACTERS: <strong className="text-ink">{charCount}</strong> / 5000</span>
            <span>WORDS: <strong className="text-ink">{wordCount}</strong></span>
            <span>EST. TIME: <strong className="text-accent">{estimatedSeconds}S</strong></span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-line">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            CANCEL
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            PUBLISH TO CLAN
          </Button>
        </div>
      </form>
    </Modal>
  );
};
