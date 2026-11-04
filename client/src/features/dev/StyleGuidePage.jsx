import React, { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Toggle,
  Tabs,
  Badge,
  Cell,
  Modal,
  Toast,
  ProgressBar,
  Avatar,
  Skeleton,
  EmptyState,
  ErrorState,
  CropMarkBox,
  CornerMarker,
  ChamferBox,
} from '../../components/ui';
import { TOKENS } from '../../constants/tokens';
import { Terminal, Shield, ArrowUpRight } from 'lucide-react';

export const StyleGuidePage = () => {
  const [activeTab, setActiveTab] = useState('components');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkboxState, setCheckboxState] = useState(true);
  const [radioState, setRadioState] = useState('opt1');
  const [toggleState, setToggleState] = useState(true);
  const [progressVal, setProgressVal] = useState(65);

  const tokens = TOKENS;

  return (
    <div className="p-8 max-w-7xl mx-auto font-mono text-ink">
      {/* Header Banner */}
      <div className="border border-line bg-surface p-6 mb-8 relative">
        <CornerMarker position="top-left" size={8} />
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-ink-muted block mb-1">
              [DEV_SPEC_00] DESIGN SYSTEM CONTRACT
            </span>
            <h1 className="font-display text-3xl md:text-4xl uppercase font-bold tracking-tight">
              TYPELEAGUE UI KIT &amp; TOKENS
            </h1>
            <p className="text-xs text-ink-soft mt-1 max-w-2xl leading-relaxed">
              Living design verification harness. Hard 90-degree geometry and chamfered cuts only.
              Monospace voice and technical blueprint grid.
            </p>
          </div>
          <Badge variant="accent" size="md">
            SPEC V2.0
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-8"
        tabs={[
          { id: 'components', label: '[01] UI COMPONENTS' },
          { id: 'tokens', label: '[02] COLOR TOKENS' },
          { id: 'typography', label: '[03] TYPE SCALE' },
          { id: 'geometry', label: '[04] GRID & GEOMETRY' },
        ]}
      />

      {/* TAB 1: COMPONENTS */}
      {activeTab === 'components' && (
        <div className="space-y-10">
          {/* Section: Buttons */}
          <Cell indexLabel="[SEC_01]" title="BUTTON PRIMITIVES">
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase text-ink-muted mb-3">Primary Chamfer Buttons</p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="primary" size="sm">PRIMARY SM</Button>
                  <Button variant="primary" size="md">PRIMARY MD (44PX)</Button>
                  <Button variant="primary" size="lg">PRIMARY LG</Button>
                  <Button variant="primary" loading>LOADING</Button>
                  <Button variant="primary" disabled>DISABLED</Button>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-ink-muted mb-3">Secondary Outline Buttons</p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="secondary" size="sm">SECONDARY SM</Button>
                  <Button variant="secondary" size="md">SECONDARY MD</Button>
                  <Button variant="secondary" size="lg">SECONDARY LG</Button>
                  <Button variant="secondary" loading>LOADING</Button>
                  <Button variant="secondary" disabled>DISABLED</Button>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-ink-muted mb-3">Tertiary Text &amp; Icon Buttons</p>
                <div className="flex flex-wrap items-center gap-6">
                  <Button variant="tertiary">TERTIARY UNDERLINE</Button>
                  <Button variant="icon" title="Terminal">
                    <Terminal size={18} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
                  </Button>
                  <Button variant="icon" title="Shield">
                    <Shield size={18} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
                  </Button>
                  <Button variant="icon" disabled>
                    <ArrowUpRight size={18} strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter" />
                  </Button>
                </div>
              </div>
            </div>
          </Cell>

          {/* Section: Form Controls */}
          <Cell indexLabel="[SEC_02]" title="FORM INPUT CONTROLS">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Standard Input"
                placeholder="Enter alphanumeric value..."
                defaultValue="valid_username_01"
              />
              <Input
                label="Error State Input"
                placeholder="Required field..."
                defaultValue="invalid_email@"
                error="Invalid email format"
              />
              <Input
                label="Disabled Input"
                placeholder="Disabled state..."
                disabled
                defaultValue="read_only_token"
              />
              <Select
                label="Select Dropdown"
                options={[
                  { value: '30', label: '30 SECONDS' },
                  { value: '60', label: '60 SECONDS' },
                  { value: '120', label: '120 SECONDS' },
                ]}
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Passage Editor Textarea"
                  rows={3}
                  defaultValue="Mechanical systems require consistent tolerances and precise layout constraints."
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-line grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <p className="text-xs uppercase text-ink-muted">Square Checkboxes</p>
                <div className="flex flex-col gap-2">
                  <Checkbox
                    label="Public visibility"
                    checked={checkboxState}
                    onChange={setCheckboxState}
                  />
                  <Checkbox label="Disabled option" checked={false} disabled />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase text-ink-muted">Square Radios</p>
                <div className="flex flex-col gap-2">
                  <Radio
                    name="radio_group"
                    label="Global scope"
                    checked={radioState === 'opt1'}
                    onChange={() => setRadioState('opt1')}
                  />
                  <Radio
                    name="radio_group"
                    label="Group scope"
                    checked={radioState === 'opt2'}
                    onChange={() => setRadioState('opt2')}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase text-ink-muted">Rectangular Toggles</p>
                <div className="flex flex-col gap-2">
                  <Toggle
                    label="Sound effects"
                    checked={toggleState}
                    onChange={setToggleState}
                  />
                  <Toggle label="Disabled setting" checked={false} disabled />
                </div>
              </div>
            </div>
          </Cell>

          {/* Section: Badges & Progress */}
          <Cell indexLabel="[SEC_03]" title="STATUS BADGES &amp; PROGRESS BARS">
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase text-ink-muted mb-3">Status Badges</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="neutral">NEUTRAL</Badge>
                  <Badge variant="accent">ACTIVE NOW</Badge>
                  <Badge variant="ok">PASSED 100%</Badge>
                  <Badge variant="error">FAILED ATTEMPT</Badge>
                  <Badge variant="outline">OFFLINE</Badge>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs uppercase text-ink-muted mb-2">
                  <span>Segmented Progress Bar ({progressVal}%)</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProgressVal(Math.max(0, progressVal - 10))}
                      className="px-2 py-0.5 border border-line hover:bg-surface"
                    >
                      -10%
                    </button>
                    <button
                      type="button"
                      onClick={() => setProgressVal(Math.min(100, progressVal + 10))}
                      className="px-2 py-0.5 border border-line hover:bg-surface"
                    >
                      +10%
                    </button>
                  </div>
                </div>
                <ProgressBar value={progressVal} max={100} variant="accent" />
              </div>

              <div>
                <p className="text-xs uppercase text-ink-muted mb-2">Ink Progress Bar</p>
                <ProgressBar value={40} max={100} variant="ink" height="h-2" />
              </div>
            </div>
          </Cell>

          {/* Section: Feedback (Toasts, Modals, States) */}
          <Cell indexLabel="[SEC_04]" title="NOTIFICATIONS, MODALS &amp; STATES">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                  TRIGGER DEMO MODAL
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Toast
                  type="info"
                  title="SYSTEM UPDATE"
                  message="Daily challenge published for 2026-11-04."
                />
                <Toast
                  type="success"
                  title="ATTEMPT ACCEPTED"
                  message="Result verified: 98 Net WPM with 100% accuracy."
                />
                <Toast
                  type="error"
                  title="VALIDATION REJECTED"
                  message="Attempt does not satisfy minimum length threshold."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EmptyState
                  title="NO ACTIVE CHALLENGES"
                  description="Today's group competition has not yet been scheduled by the moderator."
                  actionLabel="CREATE SCHEDULE"
                  onAction={() => alert('Empty state action triggered')}
                />
                <ErrorState
                  title="TELEMETRY TIMEOUT"
                  description="Unable to synchronize attempt packets with the central verification cluster."
                  onRetry={() => alert('Retry triggered')}
                />
              </div>
            </div>
          </Cell>

          {/* Section: Skeletons & Avatars */}
          <Cell indexLabel="[SEC_05]" title="AVATARS &amp; SKELETONS">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase text-ink-muted mb-3">Square Avatars</p>
                <div className="flex items-center gap-4">
                  <Avatar name="Aniket Sharma" size={48} />
                  <Avatar name="Karan Singh" size={40} />
                  <Avatar name="Dev" size={32} />
                  <Avatar name="Z" size={24} />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-ink-muted mb-3">Stepped Pulse Skeletons</p>
                <div className="space-y-2">
                  <Skeleton height="h-6" width="w-3/4" />
                  <Skeleton height="h-4" width="w-full" />
                  <Skeleton height="h-4" width="w-1/2" />
                </div>
              </div>
            </div>
          </Cell>
        </div>
      )}

      {/* TAB 2: COLOR TOKENS */}
      {activeTab === 'tokens' && (
        <Cell indexLabel="[SYS_02]" title="COLOR PALETTE SPECIFICATION">
          <p className="text-xs text-ink-soft mb-6 leading-relaxed">
            The accent is the only colour. It is used as a signal fill (roughly 5% of any screen)
            with dark ink text. Error and OK colours are strictly functional.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.map((token) => (
              <div key={token.name} className="border border-line bg-surface p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-xs uppercase text-ink">{token.name}</span>
                  <span className="text-xs font-mono text-ink-muted">{token.value}</span>
                </div>
                <div
                  className="w-full h-12 border border-line mb-3"
                  style={{ backgroundColor: `var(${token.name})` }}
                />
                <span className="text-[11px] text-ink-soft leading-snug">{token.desc}</span>
              </div>
            ))}
          </div>
        </Cell>
      )}

      {/* TAB 3: TYPOGRAPHY */}
      {activeTab === 'typography' && (
        <Cell indexLabel="[SYS_03]" title="TYPE SCALE &amp; CHARACTER HIERARCHY">
          <div className="space-y-8">
            <div className="border-b border-line pb-6">
              <span className="text-xs uppercase tracking-widest text-ink-muted block mb-2">
                DISPLAY XL &middot; TEKTUR / MICHROMA &middot; CLAMP(64PX, 14VW, 240PX)
              </span>
              <p className="font-display font-black text-4xl md:text-7xl uppercase tracking-tight leading-none">
                TYPE. COMPETE. CLIMB.
              </p>
            </div>

            <div className="border-b border-line pb-6">
              <span className="text-xs uppercase tracking-widest text-ink-muted block mb-2">
                DISPLAY L &middot; 56PX
              </span>
              <p className="font-display font-bold text-3xl md:text-5xl uppercase tracking-tight">
                GLOBAL LEADERBOARD
              </p>
            </div>

            <div className="border-b border-line pb-6">
              <span className="text-xs uppercase tracking-widest text-ink-muted block mb-2">
                HEADING (H3) &middot; JETBRAINS MONO &middot; 20PX
              </span>
              <h3 className="font-mono text-xl font-medium text-ink">
                DAILY CHALLENGE STATUS: VERIFIED
              </h3>
            </div>

            <div className="border-b border-line pb-6">
              <span className="text-xs uppercase tracking-widest text-ink-muted block mb-2">
                BODY &middot; JETBRAINS MONO &middot; 14PX (LINE HEIGHT 1.6)
              </span>
              <p className="text-sm font-mono text-ink leading-relaxed max-w-2xl">
                TypeLeague enforces strict server-side evaluation of typing metrics. Raw keystroke
                intervals are timestamped and submitted as structured telemetry packets. No client-supplied
                WPM score is accepted without verification.
              </p>
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-ink-muted block mb-2">
                TABULAR NUMERALS &middot; FONT-VARIANT-NUMERIC: TABULAR-NUMS
              </span>
              <div className="flex gap-8 font-mono tabular-nums text-lg">
                <span>0123456789</span>
                <span>WPM: 142.80</span>
                <span>ACC: 99.45%</span>
                <span>TIME: 00:59.20</span>
              </div>
            </div>
          </div>
        </Cell>
      )}

      {/* TAB 4: GEOMETRY & GRID */}
      {activeTab === 'geometry' && (
        <Cell indexLabel="[SYS_04]" title="GRID, CROP MARKS &amp; CHAMFER BOXES">
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase text-ink-muted mb-3">Crop-Mark Viewfinder Tile</p>
              <CropMarkBox
                inset={12}
                armLength={16}
                className="w-full h-48 bg-panel text-surface border border-panel-line p-8 flex flex-col justify-center items-center font-mono relative"
              >
                <div className="text-center">
                  <span className="text-xs text-accent uppercase tracking-widest block mb-1">
                    VIEWFINDER ACTIVE
                  </span>
                  <p className="text-lg font-display uppercase tracking-wider">
                    TYPING ARENA PREVIEW CONTAINER
                  </p>
                  <p className="text-xs text-ink-muted mt-2">
                    Four 12px L-brackets inset 8px. Dark panel fill with 1px border.
                  </p>
                </div>
              </CropMarkBox>
            </div>

            <div>
              <p className="text-xs uppercase text-ink-muted mb-3">ChamferBox Bordered Containers</p>
              <div className="flex flex-wrap gap-4 items-center">
                <ChamferBox size="sm" className="p-0">
                  <div className="px-6 py-3 text-xs uppercase font-medium text-ink">
                    CHAMFER-SM BOX (8PX CUT)
                  </div>
                </ChamferBox>
                <ChamferBox size="md" className="p-0">
                  <div className="px-8 py-4 text-xs uppercase font-medium text-ink">
                    CHAMFER-MD BOX (12PX CUT)
                  </div>
                </ChamferBox>
              </div>
            </div>
          </div>
        </Cell>
      )}

      {/* Demo Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="CONFIRMATION REQUIRED"
        indexLabel="[MODAL_01]"
      >
        <p className="text-xs text-ink leading-relaxed mb-6">
          This is a strictly rectangular dialog with 1px ink border and a flat 60% ink overlay.
          No glassmorphism, hard 90-degree geometry, mechanical motion.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
            CANCEL
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
            CONFIRM ACTION
          </Button>
        </div>
      </Modal>
    </div>
  );
};
