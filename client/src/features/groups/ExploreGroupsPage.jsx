import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Button,
  Input,
  Select,
  Badge,
  CropMarkBox,
  CornerMarker,
  Skeleton,
  EmptyState,
} from '../../components/ui';
import { Users, Search, Plus, Compass } from 'lucide-react';

const CATEGORIES = ['All', 'College', 'Friends', 'Coding Community', 'Technology', 'General', 'Other'];

export const ExploreGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('members');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [joiningId, setJoiningId] = useState(null);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const fetchGroups = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (search.trim()) params.append('search', search.trim());
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.get(`/groups/public?${params.toString()}`);
      setGroups(res.data.data.groups || []);
    } catch (err) {
      setError('Failed to query public communities.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [category, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGroups();
  };

  const handleJoin = async (groupId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setJoiningId(groupId);
    try {
      await api.post(`/groups/${groupId}/join`);
      navigate(`/groups/${groupId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join group.');
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto font-mono text-ink space-y-8">
      {/* Header Banner */}
      <div className="border border-line bg-surface p-6 sm:p-8 relative">
        <CornerMarker position="top-left" size={8} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
              [DISCOVERY // CLAN_DIRECTORY]
            </span>
            <h1 className="font-display text-2xl sm:text-4xl uppercase font-bold text-ink">
              EXPLORE COMMUNITIES
            </h1>
            <p className="text-xs text-ink-soft mt-1 max-w-2xl leading-relaxed">
              Discover and join public typing clans, college collectives, and competitive circles.
              Private communities can be accessed through direct cryptographic invitation links.
            </p>
          </div>
          <Link to="/groups/create">
            <Button variant="primary" size="md" className="flex items-center gap-2">
              <Plus size={16} strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" />
              <span>CREATE COMMUNITY</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="border border-line bg-surface p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search clans by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 text-xs"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-10 px-4">
            <Search size={14} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
          </Button>
        </form>

        <div className="w-full lg:w-auto flex flex-wrap items-center gap-3">
          <div className="w-44">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 text-xs"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'ALL CATEGORIES' : cat.toUpperCase()}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-44">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 text-xs"
            >
              <option value="members">MOST POPULAR</option>
              <option value="newest">NEWLY ESTABLISHED</option>
              <option value="name">ALPHABETICAL</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid of Community Cells */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-line bg-surface p-6 space-y-4">
              <Skeleton height="h-28" width="w-full" />
              <Skeleton height="h-4" width="w-3/4" />
              <Skeleton height="h-3" width="w-full" />
              <Skeleton height="h-8" width="w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="QUERY EXECUTION FAILED"
          description={error}
          actionLabel="RETRY QUERY"
          onAction={fetchGroups}
        />
      ) : groups.length === 0 ? (
        <EmptyState
          title="NO COMMUNITIES FOUND"
          description="No public typing groups matched your search or category filter. Establish the first one."
          actionLabel="CREATE COMMUNITY"
          onAction={() => navigate('/groups/create')}
          indexLabel="[DIRECTORY_EMPTY]"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((grp) => {
            const initials = grp.name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={grp._id}
                className="border border-line bg-surface hover:bg-bg transition-colors duration-100 flex flex-col justify-between relative group"
              >
                <CornerMarker position="top-left" size={6} />

                {/* Square-cropped Flat Ink-Tone Cover Treatment */}
                <div className="h-32 border-b border-line bg-panel relative flex items-center justify-center overflow-hidden">
                  {grp.coverImage ? (
                    <img
                      src={grp.coverImage}
                      alt={grp.name}
                      className="w-full h-full object-cover filter grayscale contrast-125"
                    />
                  ) : (
                    <CropMarkBox
                      inset={8}
                      armLength={12}
                      bracketColor="var(--panel-line)"
                      className="w-full h-full flex flex-col items-center justify-center"
                    >
                      <span className="font-display font-black text-3xl text-surface tracking-wider">
                        {initials}
                      </span>
                    </CropMarkBox>
                  )}
                  <span className="absolute top-2 right-2">
                    <Badge variant="neutral" size="sm">
                      {grp.category}
                    </Badge>
                  </span>
                </div>

                {/* Body Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-base uppercase font-bold text-ink mb-1.5 line-clamp-1">
                      {grp.name}
                    </h3>
                    <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed mb-4">
                      {grp.description || 'No public charter supplied.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-line flex items-center justify-between text-xs text-ink-muted">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" className="text-ink" />
                      <span className="tabular-nums font-semibold text-ink">
                        {grp.stats?.memberCount || 1}
                      </span>
                      <span>MEMBERS</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/groups/${grp._id}`}>
                        <Button variant="secondary" size="sm">
                          VIEW
                        </Button>
                      </Link>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleJoin(grp._id)}
                        loading={joiningId === grp._id}
                      >
                        JOIN
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
