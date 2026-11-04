import React, { useState } from 'react';
import { api } from '../../../services/api';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input, Select } from '../../../components/ui/Input';
import { Upload, FileText, AlertTriangle } from 'lucide-react';

export const UploadTxtModal = ({
  isOpen,
  onClose,
  groupId,
  onSuccess,
}) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.txt')) {
      setError('Only plain text (.txt) files are accepted.');
      setFile(null);
      return;
    }

    if (selectedFile.size > 100 * 1024) {
      setError('File size exceeds the 100KB limit.');
      setFile(null);
      return;
    }

    setError('');
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a .txt file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('title', title);
      data.append('category', category);
      data.append('difficulty', difficulty);
      data.append('scope', 'group');
      data.append('groupId', groupId);

      await api.post('/content/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="UPLOAD .TXT PASSAGE"
      indexLabel="[UPLOAD_01]"
      maxWidth="max-w-xl"
    >
      {error && (
        <div className="mb-4 p-3 bg-surface border border-error text-error text-xs uppercase tracking-wide">
          {error}
        </div>
      )}

      {/* Legal & Usage Responsibility Warning */}
      <div className="border border-line bg-surface p-3 mb-4 flex items-start gap-2.5 text-xs text-ink-soft">
        <AlertTriangle size={16} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="text-accent mt-0.5" />
        <p className="leading-relaxed">
          <strong>LEGAL RESPONSIBILITY:</strong> Users are solely responsible for ensuring they possess
          the necessary distribution rights and copyright permissions for any uploaded text content.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Drop / Select Area */}
        <div className="border border-line border-dashed bg-surface p-6 text-center cursor-pointer relative hover:border-ink transition-colors">
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            disabled={loading}
          />
          <div className="flex flex-col items-center">
            {file ? (
              <>
                <FileText size={28} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="text-accent mb-2" />
                <p className="text-xs uppercase font-bold text-ink">{file.name}</p>
                <p className="text-[10px] text-ink-muted mt-1 tabular-nums">
                  {(file.size / 1024).toFixed(1)} KB &middot; PLAIN TEXT
                </p>
              </>
            ) : (
              <>
                <Upload size={28} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="text-ink-muted mb-2" />
                <p className="text-xs uppercase font-medium text-ink">CLICK OR DRAG .TXT FILE HERE</p>
                <p className="text-[10px] text-ink-muted mt-1">UTF-8 ENCODING ONLY &middot; MAX 100KB</p>
              </>
            )}
          </div>
        </div>

        <Input
          label="Passage Title"
          required
          placeholder="e.g. Distributed Consensus Algorithms"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={loading}
          >
            <option value="Easy">EASY</option>
            <option value="Medium">MEDIUM</option>
            <option value="Hard">HARD</option>
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-line">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            CANCEL
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading} disabled={!file}>
            PROCESS &amp; UPLOAD
          </Button>
        </div>
      </form>
    </Modal>
  );
};
