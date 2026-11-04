import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, Link as LinkIcon, Trash2, Check, AlertTriangle } from 'lucide-react';
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

const processImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image (PNG, JPG, WEBP, GIF, SVG).'));
    }
    if (file.size > 8 * 1024 * 1024) {
      return reject(new Error('Image exceeds maximum allowed size of 8MB.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const dataUrl = reader.result;
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        return resolve({
          dataUrl,
          name: file.name,
          size: file.size,
          dimensions: 'VECTOR / ANIMATED',
        });
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Corrupt or unsupported image data.'));
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 800;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        resolve({
          dataUrl: optimizedDataUrl,
          name: file.name,
          size: Math.round((optimizedDataUrl.length * 3) / 4),
          dimensions: `${width}×${height} PX`,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
};

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
  const [imageMode, setImageMode] = useState('upload'); // 'upload' | 'url'
  const [imageInfo, setImageInfo] = useState(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setImageProcessing(true);
    try {
      const result = await processImageFile(file);
      setFormData((prev) => ({ ...prev, coverImage: result.dataUrl }));
      setImageInfo({
        name: result.name,
        size: (result.size / 1024).toFixed(1) + ' KB',
        dimensions: result.dimensions,
      });
    } catch (err) {
      setError(err.message || 'Image processing failed.');
    } finally {
      setImageProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClearImage = () => {
    setFormData((prev) => ({ ...prev, coverImage: '' }));
    setImageInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

            <div>
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
            </div>

            {/* Clan Banner / Imagery */}
            <div className="border border-line bg-bg p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-line">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-ink-muted block">
                    [MEDIA // CLAN_BANNER]
                  </span>
                  <span className="text-xs font-bold uppercase text-ink">
                    COMMUNITY COVER ARTWORK (OPTIONAL)
                  </span>
                </div>
                <div className="flex items-center gap-1 border border-line bg-surface p-0.5">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                      imageMode === 'upload'
                        ? 'bg-ink text-bg font-bold'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <Upload size={12} strokeWidth={2} />
                    FILE UPLOAD
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                      imageMode === 'url'
                        ? 'bg-ink text-bg font-bold'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <LinkIcon size={12} strokeWidth={2} />
                    IMAGE URL
                  </button>
                </div>
              </div>

              {/* Upload Mode */}
              {imageMode === 'upload' && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    className="hidden"
                  />

                  {formData.coverImage ? (
                    <div className="border border-line bg-surface p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-28 h-18 sm:w-32 sm:h-20 border border-line bg-panel shrink-0 relative overflow-hidden flex items-center justify-center">
                          <img
                            src={formData.coverImage}
                            alt="Cover Preview"
                            className="w-full h-full object-cover filter grayscale contrast-125"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="inline-block px-1.5 py-0.5 text-[9px] uppercase tracking-wider bg-ok/10 text-ok border border-ok/30">
                            IMAGE ATTACHED
                          </span>
                          <p className="text-xs font-bold text-ink truncate max-w-xs">
                            {imageInfo?.name || 'Uploaded clan cover image'}
                          </p>
                          <p className="text-[10px] text-ink-muted tabular-nums">
                            {imageInfo?.dimensions || 'CUSTOM ART'} &middot; {imageInfo?.size || 'COMPRESSED'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={loading || imageProcessing}
                        >
                          CHANGE
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={handleClearImage}
                          disabled={loading || imageProcessing}
                        >
                          <Trash2 size={12} className="mr-1" />
                          REMOVE
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                        dragActive
                          ? 'border-accent bg-accent/5'
                          : 'border-line bg-surface hover:border-ink hover:bg-bg'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-10 h-10 border border-line bg-bg flex items-center justify-center text-ink-muted">
                          {imageProcessing ? (
                            <span className="text-[10px] animate-pulse">...</span>
                          ) : (
                            <Upload size={18} strokeWidth={1.5} />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-ink">
                            {imageProcessing
                              ? 'OPTIMIZING AND ENCODING IMAGE...'
                              : 'CLICK TO SELECT IMAGE FILE OR DRAG & DROP'}
                          </p>
                          <p className="text-[10px] text-ink-muted mt-1 uppercase">
                            SUPPORTS PNG, JPG, WEBP, GIF, SVG &middot; MAX 8MB &middot; AUTO-SCALED FOR CLAN GRIDS
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* URL Mode */}
              {imageMode === 'url' && (
                <div className="space-y-3">
                  <Input
                    label="Direct Image URL"
                    name="coverImage"
                    type="url"
                    placeholder="https://images.unsplash.com/... or https://..."
                    value={formData.coverImage}
                    onChange={handleChange}
                    disabled={loading}
                  />

                  {formData.coverImage && (
                    <div className="border border-line bg-surface p-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-14 border border-line bg-panel shrink-0 relative overflow-hidden flex items-center justify-center">
                          <img
                            src={formData.coverImage}
                            alt="Preview"
                            className="w-full h-full object-cover filter grayscale contrast-125"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-ink-muted block">
                            REMOTE IMAGE SOURCE
                          </span>
                          <span className="text-xs text-ink truncate max-w-xs block font-mono">
                            {formData.coverImage}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleClearImage}
                        disabled={loading}
                      >
                        CLEAR
                      </Button>
                    </div>
                  )}
                </div>
              )}
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
