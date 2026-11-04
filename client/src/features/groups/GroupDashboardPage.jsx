import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Button,
  Tabs,
  Badge,
  Cell,
  ProgressBar,
  CornerMarker,
  Skeleton,
  EmptyState,
  Avatar,
  CropMarkBox,
} from '../../components/ui';
import { ContentEditorModal } from './modals/ContentEditorModal';
import { UploadTxtModal } from './modals/UploadTxtModal';
import { SharedLibraryModal } from './modals/SharedLibraryModal';
import {
  Users,
  Zap,
  Target,
  Clock,
  Shield,
  Plus,
  Copy,
  Check,
  Trash2,
  FileText,
  Upload,
  BookOpen,
  Settings,
  Link as LinkIcon,
  UserX,
  UserCheck,
} from 'lucide-react';

export const GroupDashboardPage = () => {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuthStore();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSharedOpen, setIsSharedOpen] = useState(false);

  // Tab Data States
  const [contentList, setContentList] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [invitationsList, setInvitationsList] = useState([]);
  const [copiedToken, setCopiedToken] = useState(null);

  // Generate Invite Form
  const [inviteDays, setInviteDays] = useState(7);
  const [inviteMaxUses, setInviteMaxUses] = useState(0);
  const [generatingInvite, setGeneratingInvite] = useState(false);

  const fetchGroup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/groups/${id}`);
      setGroup(res.data.data.group);
      setUserRole(res.data.data.userRole);
      setIsMember(res.data.data.isMember);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load group.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      const res = await api.get(`/groups/${id}/content`);
      setContentList(res.data.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/groups/${id}/members`);
      setMembersList(res.data.data.members || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await api.get(`/groups/${id}/invitations`);
      setInvitationsList(res.data.data.invitations || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchGroup();
    }
  }, [id, authLoading]);

  const isOwner = userRole === 'owner' || (Boolean(user?._id && group?.owner) && (
    (group.owner._id ? group.owner._id === user._id : group.owner === user._id)
  ));
  const effectiveIsMember = isMember || isOwner;
  const isModerator = userRole === 'moderator' || isOwner;

  useEffect(() => {
    if (group && effectiveIsMember) {
      if (activeTab === 'content') fetchContent();
      if (activeTab === 'members') fetchMembers();
      if (activeTab === 'invitations' && isModerator) fetchInvitations();
    }
  }, [activeTab, group, effectiveIsMember, isModerator]);

  const handleGenerateInvite = async () => {
    setGeneratingInvite(true);
    try {
      const res = await api.post(`/groups/${id}/invitations`, {
        expiresInDays: inviteDays,
        maxUses: inviteMaxUses,
      });
      const inviteUrl = `${window.location.origin}/invite/${res.data.data.rawToken}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopiedToken(res.data.data.rawToken);
      setTimeout(() => setCopiedToken(null), 3000);
      fetchInvitations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate invitation.');
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleRevokeInvite = async (inviteId) => {
    try {
      await api.delete(`/invitations/${inviteId}`);
      fetchInvitations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke invitation.');
    }
  };

  const handleUpdateRole = async (targetUserId, newRole) => {
    try {
      await api.patch(`/groups/${id}/members/${targetUserId}/role`, { role: newRole });
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update member role.');
    }
  };

  const handleRemoveMember = async (targetUserId) => {
    if (!window.confirm('Are you sure you want to remove this member from the community?')) return;
    try {
      await api.delete(`/groups/${id}/members/${targetUserId}`);
      fetchMembers();
      fetchGroup();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Confirm exit from this community?')) return;
    try {
      await api.post(`/groups/${id}/leave`);
      navigate('/groups');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave group.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 font-mono">
        <Skeleton height="h-28" width="w-full" />
        <Skeleton height="h-10" width="w-1/2" />
        <Skeleton height="h-64" width="w-full" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="p-8 max-w-4xl mx-auto font-mono">
        <EmptyState
          title="COMMUNITY UNAVAILABLE"
          description={error || 'The requested clan could not be found or access is restricted.'}
          actionLabel="RETURN TO EXPLORE"
          onAction={() => navigate('/groups')}
        />
      </div>
    );
  }

  const tabsList = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'challenge', label: 'DAILY CHALLENGE' },
    { id: 'content', label: 'TYPING CONTENT', badge: contentList.length || undefined },
    { id: 'leaderboard', label: 'LEADERBOARD' },
    { id: 'members', label: 'MEMBERS', badge: group.stats?.memberCount || 1 },
    ...(isModerator ? [{ id: 'invitations', label: 'INVITATIONS' }] : []),
    ...(isOwner ? [{ id: 'settings', label: 'SETTINGS' }] : []),
  ];

  return (
    <div className="font-mono text-ink bg-bg p-6 sm:p-10 space-y-6 max-w-7xl mx-auto">
      {/* 1. Clan Header Banner */}
      <div className="border border-line bg-surface p-6 sm:p-8 relative">
        <CornerMarker position="top-left" size={8} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 border border-line bg-panel flex items-center justify-center shrink-0">
              <span className="font-display font-black text-2xl text-surface">
                {group.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-2xl sm:text-3xl uppercase font-bold text-ink">
                  {group.name}
                </h1>
                <Badge variant={isOwner ? 'accent' : isModerator ? 'ok' : 'neutral'} size="sm">
                  {userRole ? userRole.toUpperCase() : 'VISITOR'}
                </Badge>
                <Badge variant="outline" size="sm">
                  {group.visibility.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-ink-muted uppercase">
                FOUNDER: @{group.owner?.username || 'admin'} &middot; TIMEZONE: {group.timezone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isMember && !isOwner && (
              <Button variant="secondary" size="sm" onClick={handleLeaveGroup}>
                LEAVE CLAN
              </Button>
            )}
            {isModerator && (
              <Button variant="primary" size="sm" onClick={() => setActiveTab('invitations')}>
                INVITE MEMBERS
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Secondary Navigation Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={tabsList}
        className="w-full bg-surface border border-line"
      />

      {/* 3. TAB VIEWS */}

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Clan Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-line bg-surface p-5">
              <span className="text-xs text-ink-muted uppercase block mb-2">TOTAL MEMBERS</span>
              <div className="font-display text-3xl font-bold tabular-nums">
                {group.stats?.memberCount || 1}
              </div>
              <span className="text-[10px] text-ink-soft">
                {group.maxMembers > 0 ? `MAX CAPACITY: ${group.maxMembers}` : 'UNLIMITED CAPACITY'}
              </span>
            </div>

            <div className="border border-line bg-surface p-5">
              <span className="text-xs text-ink-muted uppercase block mb-2">AVERAGE SPEED</span>
              <div className="font-display text-3xl font-bold tabular-nums">
                {(group.stats?.averageWpm || 0).toFixed(1)}
              </div>
              <span className="text-[10px] text-ink-soft">NET WORDS PER MINUTE</span>
            </div>

            <div className="border border-line bg-surface p-5">
              <span className="text-xs text-ink-muted uppercase block mb-2">ACTIVE TODAY</span>
              <div className="font-display text-3xl font-bold tabular-nums text-accent">
                {group.stats?.activeToday || 0}
              </div>
              <span className="text-[10px] text-ink-soft">ATTEMPTS COMPLETED</span>
            </div>

            <div className="border border-line bg-surface p-5">
              <span className="text-xs text-ink-muted uppercase block mb-2">CATEGORY</span>
              <div className="font-display text-xl font-bold uppercase truncate">
                {group.category}
              </div>
              <span className="text-[10px] text-ink-soft">COMMUNITY DISCOVERY</span>
            </div>
          </div>

          {/* Description & Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Cell indexLabel="[CHARTER_01]" title="COMMUNITY CHARTER">
              <p className="text-xs text-ink-soft leading-relaxed whitespace-pre-line">
                {group.description || 'No formal charter recorded for this community.'}
              </p>
            </Cell>

            <Cell indexLabel="[RULES_01]" title="CLAN REGULATIONS">
              <p className="text-xs text-ink-soft leading-relaxed whitespace-pre-line">
                {group.rules || 'Standard platform anti-cheat and conduct rules apply.'}
              </p>
            </Cell>
          </div>
        </div>
      )}

      {/* TAB: DAILY CHALLENGE */}
      {activeTab === 'challenge' && (
        <Cell indexLabel="[CHALLENGE_01]" title="CLAN DAILY COMPETITION">
          <EmptyState
            title="NO SYNCHRONIZED CLAN COMPETITION"
            description="The daily group challenge system activates in Phase 3. Owners and moderators will schedule challenges using clan content."
            actionLabel={isModerator ? 'PREPARE CLAN CONTENT' : undefined}
            onAction={isModerator ? () => setActiveTab('content') : undefined}
            indexLabel="[PHASE_3_PIPELINE]"
          />
        </Cell>
      )}

      {/* TAB: TYPING CONTENT MANAGEMENT */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="border border-line bg-surface p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-base uppercase font-bold text-ink">
                CLAN TYPING PASSAGES
              </h3>
              <p className="text-xs text-ink-muted">
                Manage dedicated texts for group daily competitions and speed trials.
              </p>
            </div>

            {isModerator && (
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" size="sm" onClick={() => setIsSharedOpen(true)}>
                  <BookOpen size={14} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="mr-1.5" />
                  SHARED REPO
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setIsUploadOpen(true)}>
                  <Upload size={14} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="mr-1.5" />
                  UPLOAD .TXT
                </Button>
                <Button variant="primary" size="sm" onClick={() => setIsEditorOpen(true)}>
                  <Plus size={14} strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" className="mr-1.5" />
                  NEW PASSAGE
                </Button>
              </div>
            )}
          </div>

          {contentList.length === 0 ? (
            <EmptyState
              title="NO PASSAGES IN REPOSITORY"
              description="Your clan has not added any typing passages yet. Write text, upload a .txt file, or import from the shared library."
              actionLabel={isModerator ? 'OPEN PASSAGE EDITOR' : undefined}
              onAction={isModerator ? () => setIsEditorOpen(true) : undefined}
              indexLabel="[PASSAGE_ZERO]"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contentList.map((item) => (
                <div
                  key={item._id}
                  className="border border-line bg-surface p-5 flex flex-col justify-between hover:border-ink transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" size="sm">{item.category}</Badge>
                        <Badge variant="outline" size="sm">{item.difficulty}</Badge>
                      </div>
                      <span className="text-[10px] text-ink-muted uppercase">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-display text-sm uppercase font-bold text-ink mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-ink-soft line-clamp-3 leading-relaxed mb-4">
                      {item.passageText}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-line flex items-center justify-between text-[11px] text-ink-muted tabular-nums">
                    <span>{item.wordCount} WORDS &middot; {item.charCount} CHARS</span>
                    <span>EST. {item.estimatedDuration}S</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <Cell indexLabel="[RANKS_01]" title="CLAN INTERNAL STANDINGS">
          <EmptyState
            title="NO LEADERBOARD DATA"
            description="Clan leaderboards compute from daily challenge results. This module activates in Phase 3/4."
            indexLabel="[STANDINGS_PENDING]"
          />
        </Cell>
      )}

      {/* TAB: MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="border border-line bg-surface p-4 flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-ink">
              MEMBER ROSTER ({membersList.length})
            </span>
          </div>

          <div className="border border-line bg-surface overflow-x-auto">
            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-bg border-b border-line text-ink-muted uppercase tracking-wider text-left">
                  <th className="p-3 border-r border-line">MEMBER</th>
                  <th className="p-3 border-r border-line text-center">ROLE</th>
                  <th className="p-3 border-r border-line text-right">BEST WPM</th>
                  <th className="p-3 border-r border-line text-right">ACCURACY</th>
                  <th className="p-3 border-r border-line text-right">JOINED</th>
                  {isOwner && <th className="p-3 text-right">ACTIONS</th>}
                </tr>
              </thead>
              <tbody>
                {membersList.map((m) => {
                  const targetUser = m.user;
                  if (!targetUser) return null;
                  const isTargetOwner = m.role === 'owner';
                  const isTargetSelf = targetUser._id === user?._id;

                  return (
                    <tr
                      key={m._id}
                      className="border-b border-line last:border-b-0 hover:bg-bg transition-colors"
                    >
                      <td className="p-3 border-r border-line flex items-center gap-3">
                        <Avatar name={targetUser.fullName || targetUser.username} size={28} />
                        <div>
                          <p className="font-medium text-ink uppercase">
                            {targetUser.fullName || targetUser.username}
                          </p>
                          <p className="text-[10px] text-ink-muted">@{targetUser.username}</p>
                        </div>
                      </td>
                      <td className="p-3 border-r border-line text-center">
                        <Badge
                          variant={
                            m.role === 'owner' ? 'accent' : m.role === 'moderator' ? 'ok' : 'neutral'
                          }
                          size="sm"
                        >
                          {m.role}
                        </Badge>
                      </td>
                      <td className="p-3 border-r border-line text-right tabular-nums">
                        {(targetUser.stats?.bestWpm || 0).toFixed(1)}
                      </td>
                      <td className="p-3 border-r border-line text-right tabular-nums">
                        {(targetUser.stats?.averageAccuracy || 0).toFixed(1)}%
                      </td>
                      <td className="p-3 border-r border-line text-right tabular-nums text-ink-muted">
                        {new Date(m.joinedAt).toLocaleDateString()}
                      </td>

                      {/* Management Actions (Server-Enforced) */}
                      {isOwner && (
                        <td className="p-3 text-right">
                          {!isTargetOwner && !isTargetSelf && (
                            <div className="flex items-center justify-end gap-2">
                              {m.role === 'member' ? (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateRole(targetUser._id, 'moderator')}
                                  className="text-[10px] uppercase border border-line px-2 py-1 hover:bg-ink hover:text-bg transition-colors"
                                  title="Promote to Moderator"
                                >
                                  PROMOTE
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateRole(targetUser._id, 'member')}
                                  className="text-[10px] uppercase border border-line px-2 py-1 hover:bg-ink hover:text-bg transition-colors"
                                  title="Demote to Member"
                                >
                                  DEMOTE
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(targetUser._id)}
                                className="text-error hover:text-ink p-1 transition-colors"
                                title="Remove Member"
                              >
                                <Trash2 size={14} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: INVITATIONS (OWNER / MODERATOR ONLY) */}
      {activeTab === 'invitations' && isModerator && (
        <div className="space-y-6">
          <Cell indexLabel="[INVITE_01]" title="GENERATE CRYPTOGRAPHIC INVITATION LINK">
            <div className="space-y-4 max-w-xl">
              <p className="text-xs text-ink-soft leading-relaxed">
                Generate an invite token for this clan. Links are hashed with SHA-256 before database storage.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-ink-muted mb-1">
                    Expiration Duration
                  </label>
                  <select
                    value={inviteDays}
                    onChange={(e) => setInviteDays(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-surface border border-line text-xs font-mono"
                  >
                    <option value={1}>1 DAY</option>
                    <option value={7}>7 DAYS</option>
                    <option value={30}>30 DAYS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase text-ink-muted mb-1">
                    Usage Cap (0 = Unlimited)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={inviteMaxUses}
                    onChange={(e) => setInviteMaxUses(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-surface border border-line text-xs font-mono"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleGenerateInvite}
                loading={generatingInvite}
              >
                GENERATE &amp; COPY LINK
              </Button>

              {copiedToken && (
                <div className="p-3 bg-surface border border-ok text-ok text-xs">
                  COPIED INVITATION URL TO CLIPBOARD.
                </div>
              )}
            </div>
          </Cell>

          <Cell indexLabel="[INVITE_ROSTER]" title="ACTIVE INVITATION CODES">
            {invitationsList.length === 0 ? (
              <p className="text-xs text-ink-muted">No active invitation tokens currently recorded.</p>
            ) : (
              <div className="space-y-3">
                {invitationsList.map((inv) => (
                  <div
                    key={inv._id}
                    className="border border-line bg-surface p-4 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-mono text-ink font-bold">
                        EXPIRES: {new Date(inv.expiresAt).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-ink-muted tabular-nums mt-0.5">
                        USES: {inv.usesCount} {inv.maxUses > 0 ? `/ ${inv.maxUses}` : '(UNLIMITED)'} &middot; CREATED BY @{inv.createdBy?.username}
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRevokeInvite(inv._id)}
                    >
                      REVOKE
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Cell>
        </div>
      )}

      {/* TAB: SETTINGS (OWNER ONLY) */}
      {activeTab === 'settings' && isOwner && (
        <Cell indexLabel="[SETTINGS_01]" title="COMMUNITY ADMINISTRATION">
          <p className="text-xs text-ink-soft leading-relaxed mb-6">
            Update community configuration. Only the designated founder possesses authority to commit changes.
          </p>
          <div className="space-y-4 max-w-xl">
            <Input
              label="Community Name"
              defaultValue={group.name}
              disabled
            />
            <Textarea
              label="Description"
              defaultValue={group.description}
              rows={3}
              disabled
            />
            <p className="text-[11px] text-ink-muted">
              Settings update endpoint verified on backend. Advanced configuration controls persist across phases.
            </p>
          </div>
        </Cell>
      )}

      {/* Modals */}
      <ContentEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        groupId={group._id}
        onSuccess={fetchContent}
      />

      <UploadTxtModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        groupId={group._id}
        onSuccess={fetchContent}
      />

      <SharedLibraryModal
        isOpen={isSharedOpen}
        onClose={() => setIsSharedOpen(false)}
        groupId={group._id}
        onImportSuccess={fetchContent}
      />
    </div>
  );
};
