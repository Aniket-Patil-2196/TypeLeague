import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Button,
  Input,
  Textarea,
  Select,
  Radio,
  Cell,
  CornerMarker,
} from '../../components/ui';

export const CreateGroupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Technology',
    visibility: 'public',
    rules: '',
    maxMembers: '',
    timezone: 'Asia/Kolkata',
    coverImage: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Community name is mandatory.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        maxMembers: formData.maxMembers ? Number(formData.maxMembers) : 0,
      };
      const res = await api.post('/groups', payload);
      navigate(`/groups/${res.data.data.group._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto font-mono text-ink space-y-8">
      {/* Page Header */}
      <div className="border border-line bg-surface p-6 sm:p-8 relative">
        <CornerMarker position="top-left" size={8} />
        <div>
          <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
            [CREATE // CLAN_FOUNDATION]
          </span>
          <h1 className="font-display text-2xl sm:text-4xl uppercase font-bold text-ink">
            INITIALIZE COMMUNITY
          </h1>
          <p className="text-xs text-ink-soft mt-1 leading-relaxed">
            Establish a competitive typing clan, company guild, or academic cohort.
            As founder, you will be assigned the Group Owner role.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-surface border border-error text-error text-xs uppercase tracking-wide">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* [01] BASICS */}
        <Cell indexLabel="[01] BASICS" title="COMMUNITY IDENTITY">
          <div className="space-y-4">
            <Input
              label="Community Name"
              name="name"
              required
              placeholder="e.g. Bangalore Algorithm Typists"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />

            <Textarea
              label="Description &amp; Mission"
              name="description"
              rows={3}
              placeholder="Brief summary of your clan purpose..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Primary Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="Technology">TECHNOLOGY</option>
                <option value="Coding Community">CODING COMMUNITY</option>
                <option value="College">COLLEGE / CAMPUS</option>
                <option value="Friends">FRIENDS CIRCLE</option>
                <option value="General">GENERAL</option>
                <option value="Other">OTHER</option>
              </Select>

              <Input
                label="Cover Image URL (Optional)"
                name="coverImage"
                type="url"
                placeholder="https://..."
                value={formData.coverImage}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
        </Cell>

        {/* [02] VISIBILITY */}
        <Cell indexLabel="[02] VISIBILITY" title="DISCOVERY PROTOCOL">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setFormData((p) => ({ ...p, visibility: 'public' }))}
                className={`p-4 border cursor-pointer transition-colors ${
                  formData.visibility === 'public'
                    ? 'border-ink bg-surface'
                    : 'border-line bg-bg hover:border-ink-soft'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Radio
                    name="visibility"
                    checked={formData.visibility === 'public'}
                    onChange={() => setFormData((p) => ({ ...p, visibility: 'public' }))}
                    label="PUBLIC COMMUNITY"
                  />
                </div>
                <p className="text-xs text-ink-soft leading-relaxed pl-6">
                  Listed in the Explore directory. Anyone can join freely without an invitation code.
                </p>
              </div>

              <div
                onClick={() => setFormData((p) => ({ ...p, visibility: 'private' }))}
                className={`p-4 border cursor-pointer transition-colors ${
                  formData.visibility === 'private'
                    ? 'border-ink bg-surface'
                    : 'border-line bg-bg hover:border-ink-soft'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Radio
                    name="visibility"
                    checked={formData.visibility === 'private'}
                    onChange={() => setFormData((p) => ({ ...p, visibility: 'private' }))}
                    label="PRIVATE CLAN"
                  />
                </div>
                <p className="text-xs text-ink-soft leading-relaxed pl-6">
                  Hidden from public discovery. Members must be invited via secure cryptographic invitation links.
                </p>
              </div>
            </div>
          </div>
        </Cell>

        {/* [03] RULES */}
        <Cell indexLabel="[03] RULES" title="CLAN REGULATIONS">
          <div className="space-y-4">
            <Textarea
              label="Clan Rules &amp; Competition Code of Conduct"
              name="rules"
              rows={3}
              placeholder="e.g. Mechanical keyboards only. No paste scripts. One official attempt per day."
              value={formData.rules}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </Cell>

        {/* [04] LIMITS */}
        <Cell indexLabel="[04] LIMITS" title="CAPACITY &amp; TIMEZONE">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Max Members (Leave blank for unlimited)"
              name="maxMembers"
              type="number"
              min="0"
              placeholder="e.g. 50"
              value={formData.maxMembers}
              onChange={handleChange}
              disabled={loading}
            />

            <Select
              label="Standard Daily Timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Asia/Kolkata">ASIA/KOLKATA (IST)</option>
              <option value="UTC">UTC (UNIVERSAL)</option>
              <option value="America/New_York">AMERICA/NEW_YORK (EST)</option>
              <option value="Europe/London">EUROPE/LONDON (GMT)</option>
              <option value="Asia/Tokyo">ASIA/TOKYO (JST)</option>
            </Select>
          </div>
        </Cell>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => navigate('/groups')}
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
          >
            CONFIRM &amp; ESTABLISH COMMUNITY
          </Button>
        </div>
      </form>
    </div>
  );
};
