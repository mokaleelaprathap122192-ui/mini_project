'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircle,
  ShieldCheck,
  Bell,
  Palette,
  KeyRound,
  Settings as SettingsIcon,
  Camera,
  Save,
  Mail,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Laptop,
  MapPin,
  AlertTriangle,
  FileText,
  BarChart3,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge, Separator } from '@/components/ui/label';
import { Label } from '@/components/ui/label';
import { cn, formatDate } from '@/lib/utils';

const PROFILE = {
  name: 'Dr. Ananya Sharma',
  email: 'ananya.sharma@iisc.ac.in',
  org: 'Indian Institute of Science · NLP Lab',
  bio: 'Computational linguist focusing on cross-lingual fairness for low-resource Indian languages.',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya&backgroundColor=1e293b',
  website: 'https://iisc.ac.in/~ananya',
  location: 'Bengaluru, India',
};

const SESSIONS = [
  { id: 's1', device: 'MacBook Pro 16"', browser: 'Chrome 126', os: 'macOS 14.5', location: 'Bengaluru, IN', ip: '103.24.55.89', lastActive: '2025-07-28T10:12:00', current: true },
  { id: 's2', device: 'iPhone 15 Pro', browser: 'Safari 17', os: 'iOS 17.5', location: 'Bengaluru, IN', ip: '103.24.55.89', lastActive: '2025-07-27T19:45:00', current: false },
  { id: 's3', device: 'ThinkPad X1 Carbon', browser: 'Firefox 127', os: 'Ubuntu 24.04', location: 'Mumbai, IN', ip: '45.79.12.18', lastActive: '2025-07-25T08:30:00', current: false },
];

const API_KEYS = [
  { id: 'k1', name: 'Research Lab Production', key: 'sk_live_7f9a…x8K2', created: '2025-06-10', lastUsed: '2025-07-28', usage: 48291, status: 'active' },
  { id: 'k2', name: 'Staging Environment', key: 'sk_test_b4m2…pQ11', created: '2025-05-22', lastUsed: '2025-07-20', usage: 8421, status: 'active' },
  { id: 'k3', name: 'Personal Dev Key', key: 'sk_dev_zx39…nT77', created: '2025-04-01', lastUsed: '2025-07-01', usage: 1203, status: 'revoked' },
];

const ACCENTS = [
  { id: 'blue', name: 'Neon Blue', color: '#2563EB' },
  { id: 'purple', name: 'Neon Purple', color: '#7C3AED' },
  { id: 'cyan', name: 'Neon Cyan', color: '#06B6D4' },
];

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Toggle({ checked, onChange, size = 'md' }: { checked: boolean; onChange: (v: boolean) => void; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? { w: 'w-9', h: 'h-5', dot: 'w-4 h-4', off: 'translate-x-0.5', on: 'translate-x-[18px]' } : { w: 'w-12', h: 'h-7', dot: 'w-5 h-5', off: 'translate-x-1', on: 'translate-x-6' };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        dim.w, dim.h,
        'relative inline-flex shrink-0 cursor-pointer rounded-full border border-white/15 transition-colors',
        checked ? 'bg-gradient-to-r from-neon-blue to-neon-purple shadow-glow-purple' : 'bg-white/10',
      )}
    >
      <span className={cn('pointer-events-none inline-block rounded-full bg-white shadow-md ring-0 transition-transform duration-200', dim.dot, dim.w, checked ? dim.on : dim.off, 'self-center m-0.5')} style={{ margin: 0, transform: checked ? `translateX(${size === 'sm' ? 18 : 24}px)` : 'translateX(2px)' }} />
    </button>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState(PROFILE);
  const [saved, setSaved] = useState(false);

  const [notif, setNotif] = useState({ auditDoneEmail: true, auditDonePush: true, alertEmail: true, alertPush: false, weeklyEmail: true, weeklyPush: false });
  const [security, setSecurity] = useState({ currentPw: '', newPw: '', confirmPw: '', twoFA: true });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [accent, setAccent] = useState('purple');
  const [newKeyModal, setNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [visibleKey, setVisibleKey] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const triggerSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyKey = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30">
            <SettingsIcon className="w-6 h-6 text-neon-purple" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-0.5">
              <span className="gradient-text">User Settings</span>
            </h1>
            <p className="text-muted-foreground text-sm">Manage your profile, security, appearance, and API credentials</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <GlassPanel>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full grid grid-cols-5 max-w-2xl">
              <TabsTrigger value="profile" className="gap-1.5"><UserCircle className="w-4 h-4" />Profile</TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5"><ShieldCheck className="w-4 h-4" />Security</TabsTrigger>
              <TabsTrigger value="notifs" className="gap-1.5"><Bell className="w-4 h-4" />Notifications</TabsTrigger>
              <TabsTrigger value="appearance" className="gap-1.5"><Palette className="w-4 h-4" />Appearance</TabsTrigger>
              <TabsTrigger value="apikeys" className="gap-1.5"><KeyRound className="w-4 h-4" />API Keys</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8">
                <div className="text-center lg:text-left">
                  <div className="relative inline-block p-1 rounded-full bg-gradient-to-br from-neon-blue via-neon-purple to-neon-cyan shadow-glow-purple">
                    <Image src={profile.avatar} alt={profile.name} width={128} height={128} className="w-32 h-32 rounded-full bg-navy-900 object-cover" />
                    <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple border-2 border-navy-900 flex items-center justify-center text-white hover:shadow-glow-purple transition-shadow">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="mt-4 font-semibold text-lg">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">{profile.org}</p>
                  <Button variant="glass" size="sm" className="mt-4"><Camera className="w-4 h-4" />Upload Photo</Button>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input className="mt-2" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Email Address</Label>
                      <Input className="mt-2" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                    </div>
                    <div>
                      <Label>Organization</Label>
                      <Input className="mt-2" value={profile.org} onChange={(e) => setProfile({ ...profile, org: e.target.value })} />
                    </div>
                    <div>
                      <Label>Website</Label>
                      <Input className="mt-2" type="url" value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Location</Label>
                      <Input className="mt-2" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Short Bio</Label>
                      <Textarea className="mt-2 min-h-[100px]" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Button onClick={triggerSaved}>{saved ? <Check className="w-4 h-4 text-neon-green" /> : <Save className="w-4 h-4" />}{saved ? 'Saved!' : 'Save Changes'}</Button>
                    <Button variant="glass">Cancel</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-6 space-y-6">
              <div>
                <h3 className="font-display font-semibold text-lg mb-1 flex items-center gap-2"><Lock className="w-5 h-5 text-neon-purple" />Change Password</h3>
                <p className="text-sm text-muted-foreground mb-4">Use a strong, unique password with at least 12 characters.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><Label>Current Password</Label><Input type="password" className="mt-2" value={security.currentPw} onChange={(e) => setSecurity({ ...security, currentPw: e.target.value })} /></div>
                  <div><Label>New Password</Label><Input type="password" className="mt-2" value={security.newPw} onChange={(e) => setSecurity({ ...security, newPw: e.target.value })} /></div>
                  <div><Label>Confirm New Password</Label><Input type="password" className="mt-2" value={security.confirmPw} onChange={(e) => setSecurity({ ...security, confirmPw: e.target.value })} /></div>
                </div>
                <Button className="mt-4" onClick={triggerSaved}>{saved ? <Check className="w-4 h-4 text-neon-green" /> : <Save className="w-4 h-4" />}{saved ? 'Updated!' : 'Update Password'}</Button>
              </div>

              <Separator />

              <div className="rounded-xl p-5 bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Smartphone className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">Two-Factor Authentication <Badge variant="success" className="!text-[10px]">Recommended</Badge></h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security. Use an authenticator app like Google Authenticator or Authy.</p>
                  </div>
                </div>
                <Toggle checked={security.twoFA} onChange={(v) => setSecurity({ ...security, twoFA: v })} />
              </div>

              <Separator />

              <div>
                <h3 className="font-display font-semibold text-lg mb-1 flex items-center gap-2"><Laptop className="w-5 h-5 text-neon-blue" />Active Sessions ({SESSIONS.length})</h3>
                <p className="text-sm text-muted-foreground mb-4">Sign out of sessions you don&apos;t recognize.</p>
                <div className="space-y-2">
                  {SESSIONS.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl p-4 bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-start justify-between gap-4 flex-wrap"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Monitor className="w-5 h-5 text-neon-purple" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="font-medium text-sm">{s.device}</p>
                            {s.current && <Badge variant="success" className="!text-[10px]">Current</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{s.browser} · {s.os} · <span className="flex items-center gap-1 inline-flex"><MapPin className="w-3 h-3" />{s.location}</span></p>
                          <p className="text-[11px] text-muted-foreground/70 font-mono mt-0.5">IP {s.ip} · Last active {formatDate(s.lastActive)}</p>
                        </div>
                      </div>
                      <Button variant="glass" size="sm" disabled={s.current}><Trash2 className="w-3.5 h-3.5" />{s.current ? 'This session' : 'Sign out'}</Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifs" className="mt-6">
              <div className="space-y-4">
                {[
                  { keyEmail: 'auditDoneEmail', keyPush: 'auditDonePush', title: 'Audit Completed', desc: 'Get notified when a fairness audit pipeline finishes.', icon: BarChart3, color: '#7C3AED' },
                  { keyEmail: 'alertEmail', keyPush: 'alertPush', title: 'High-Severity Alerts', desc: 'Immediate alerts for significant bias, degradation, or system failures.', icon: AlertTriangle, color: '#F59E0B' },
                  { keyEmail: 'weeklyEmail', keyPush: 'weeklyPush', title: 'Weekly Digest Report', desc: 'Roll-up of audits run, CLFI trends, and top recommendations every Monday.', icon: FileText, color: '#06B6D4' },
                ].map((n, i) => (
                  <motion.div
                    key={n.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl p-5 bg-white/[0.03] border border-white/10 flex items-start justify-between gap-6"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${n.color}25, ${n.color}10)` }}>
                        <n.icon className="w-5 h-5" style={{ color: n.color }} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{n.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-lg">{n.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <Toggle checked={(notif as any)[n.keyEmail]} onChange={(v) => setNotif({ ...notif, [n.keyEmail]: v })} size="sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                        <Toggle checked={(notif as any)[n.keyPush]} onChange={(v) => setNotif({ ...notif, [n.keyPush]: v })} size="sm" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Button onClick={triggerSaved}>{saved ? <Check className="w-4 h-4 text-neon-green" /> : <Save className="w-4 h-4" />}{saved ? 'Saved!' : 'Save Preferences'}</Button>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="mt-6 space-y-6">
              <div>
                <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2"><Monitor className="w-5 h-5 text-neon-blue" />Theme Mode</h3>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-left',
                      theme === 'dark' ? 'border-neon-purple bg-gradient-to-br from-neon-purple/15 to-neon-blue/10 shadow-glow-purple' : 'border-white/10 bg-white/[0.02] hover:border-white/20',
                    )}
                  >
                    <Moon className="w-5 h-5 mb-2 text-neon-purple" />
                    <p className="font-semibold text-sm">Dark</p>
                    <p className="text-[11px] text-muted-foreground">Default · Easy on eyes</p>
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-left',
                      theme === 'light' ? 'border-neon-purple bg-gradient-to-br from-neon-purple/15 to-neon-blue/10 shadow-glow-purple' : 'border-white/10 bg-white/[0.02] hover:border-white/20',
                    )}
                  >
                    <Sun className="w-5 h-5 mb-5 text-neon-amber" />
                    <p className="font-semibold text-sm">Light</p>
                    <p className="text-[11px] text-muted-foreground">Clean · High contrast</p>
                  </button>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2"><Palette className="w-5 h-5 text-neon-cyan" />Accent Color</h3>
                <div className="flex items-center gap-4 flex-wrap">
                  {ACCENTS.map((a) => {
                    const active = accent === a.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setAccent(a.id)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl p-3 pr-5 border-2 transition-all',
                          active ? 'border-white/30 bg-white/[0.06]' : 'border-white/10 bg-white/[0.02] hover:border-white/20',
                        )}
                      >
                        <span className={cn('w-9 h-9 rounded-xl shrink-0 shadow-lg transition-transform', active ? 'scale-110' : '')} style={{ background: `linear-gradient(135deg, ${a.color}, ${a.color}bb)`, boxShadow: active ? `0 0 20px ${a.color}80` : undefined }} />
                        <div className="text-left">
                          <p className="font-medium text-sm">{a.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{a.color}</p>
                        </div>
                        {active && <Check className="w-5 h-5 text-neon-green ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="apikeys" className="mt-6 space-y-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-display font-semibold text-lg mb-1 flex items-center gap-2"><KeyRound className="w-5 h-5 text-neon-purple" />API Keys</h3>
                  <p className="text-sm text-muted-foreground">Manage keys for programmatic access. Never share them in public repositories.</p>
                </div>
                <Button onClick={() => { setNewKeyModal(true); }}><Plus className="w-4 h-4" />Create New Key</Button>
              </div>

              {newKeyModal && (
                <div className="rounded-xl p-5 bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 border border-neon-purple/30">
                  <Label>Key Name</Label>
                  <Input className="mt-2 mb-3" placeholder="e.g. Production Server" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
                  <div className="flex items-center gap-3">
                    <Button onClick={() => { setNewKeyName(''); setNewKeyModal(false); }}>Generate Key</Button>
                    <Button variant="glass" onClick={() => { setNewKeyName(''); setNewKeyModal(false); }}>Cancel</Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto -mx-2">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="px-3 py-3 font-medium">Name</th>
                      <th className="px-3 py-3 font-medium">Key</th>
                      <th className="px-3 py-3 font-medium">Created</th>
                      <th className="px-3 py-3 font-medium">Last Used</th>
                      <th className="px-3 py-3 font-medium">Requests</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {API_KEYS.map((k, i) => (
                      <motion.tr
                        key={k.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-3 py-3.5 font-medium text-sm">{k.name}</td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-muted-foreground">
                              {visibleKey[k.id] ? k.key : k.key}
                            </code>
                            <button onClick={() => setVisibleKey({ ...visibleKey, [k.id]: !visibleKey[k.id] })} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
                              {visibleKey[k.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button onClick={() => copyKey(k.id, k.key)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-neon-cyan transition-colors">
                              {copiedKey === k.id ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-sm text-muted-foreground font-mono">{k.created}</td>
                        <td className="px-3 py-3.5 text-sm text-muted-foreground font-mono">{k.lastUsed}</td>
                        <td className="px-3 py-3.5 text-sm font-mono">{k.usage.toLocaleString()}</td>
                        <td className="px-3 py-3.5">
                          <Badge variant={k.status === 'active' ? 'success' : 'danger'} className="!text-[10px] !px-2.5 capitalize">{k.status}</Badge>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            {k.status === 'active' ? (
                              <button className="h-8 px-3 rounded-lg hover:bg-neon-red/10 text-xs font-medium text-muted-foreground hover:text-neon-red border border-transparent hover:border-neon-red/30 transition-all">Revoke</button>
                            ) : (
                              <button className="h-8 px-3 rounded-lg hover:bg-neon-green/10 text-xs font-medium text-muted-foreground hover:text-neon-green border border-transparent hover:border-neon-green/30 transition-all">Reactivate</button>
                            )}
                            <button className="w-8 h-8 rounded-lg hover:bg-neon-red/10 flex items-center justify-center text-muted-foreground hover:text-neon-red transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
