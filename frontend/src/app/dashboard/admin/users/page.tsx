'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  UserPlus,
  Edit3,
  Trash2,
  UserCheck,
  Crown,
  Building,
  CalendarDays,
  Clock,
  Mail,
  X,
  Save,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge, Separator } from '@/components/ui/label';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn, formatDate } from '@/lib/utils';
import type { User, UserRole } from '@/types';

const USERS: (User & { status: 'active' | 'disabled' })[] = [
  { id: 'u1', name: 'Dr. Ananya Sharma', email: 'ananya.sharma@iisc.ac.in', role: 'researcher', organization: 'IISc Bengaluru', createdAt: '2024-03-15', lastLogin: '2025-07-28T10:12:00', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya', status: 'active' },
  { id: 'u2', name: 'Karthik Menon', email: 'karthik.m@iitm.ac.in', role: 'admin', organization: 'IIT Madras', createdAt: '2023-11-20', lastLogin: '2025-07-28T09:05:00', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik', status: 'active' },
  { id: 'u3', name: 'Priya Desai', email: 'priya.desai@research.org', role: 'student', organization: 'IIT Bombay', createdAt: '2025-02-10', lastLogin: '2025-07-27T18:40:00', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', status: 'active' },
  { id: 'u4', name: 'Rohan Kulkarni', email: 'rohan.k@iiitb.ac.in', role: 'researcher', organization: 'IIIT Bangalore', createdAt: '2024-08-02', lastLogin: '2025-07-26T14:20:00', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan', status: 'active' },
  { id: 'u5', name: 'Divya Banerjee', email: 'divya.b@ju.ac.in', role: 'student', organization: 'Jadavpur Univ.', createdAt: '2025-04-18', lastLogin: '2025-07-12T08:10:00', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Divya', status: 'active' },
  { id: 'u6', name: 'Aditya Patel', email: 'aditya.p@guest.edu', role: 'guest', organization: 'External', createdAt: '2025-06-05', lastLogin: '2025-07-20T11:30:00', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya', status: 'active' },
  { id: 'u7', name: 'Meera Nair', email: 'meera.n@cusat.ac.in', role: 'researcher', organization: 'CUSAT Kochi', createdAt: '2024-12-01', lastLogin: '2025-07-28T07:50:00', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera', status: 'active' },
  { id: 'u8', name: 'Arjun Rao', email: 'arjun.r@old.in', role: 'researcher', organization: 'Retired', createdAt: '2023-09-10', lastLogin: '2025-03-22T16:40:00', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun', status: 'disabled' },
];

const ROLE_VARIANT: Record<UserRole, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'> = {
  admin: 'danger',
  researcher: 'info',
  student: 'success',
  guest: 'outline',
};

const ROLE_ICON: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  admin: Crown,
  researcher: UserCheck,
  student: Users,
  guest: UserCheck,
};

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  if (src) return <Image src={src} alt={name} width={size} height={size} className="rounded-full bg-navy-900 object-cover border-2 border-white/10" style={{ width: size, height: size }} />;
  return (
    <div className="rounded-full bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 flex items-center justify-center font-display font-bold text-white border-2 border-white/10 text-xs" style={{ width: size, height: size }}>
      {initials}
    </div>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('student');
  const [inviteOrg, setInviteOrg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const filtered = USERS.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    const q = search.toLowerCase();
    if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !(u.organization || '').toLowerCase().includes(q)) return false;
    return true;
  });

  const counts = {
    all: USERS.length,
    admin: USERS.filter((u) => u.role === 'admin').length,
    researcher: USERS.filter((u) => u.role === 'researcher').length,
    student: USERS.filter((u) => u.role === 'student').length,
    guest: USERS.filter((u) => u.role === 'guest').length,
  };

  const sendInvite = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setInviteOpen(false);
        setInviteEmail('');
        setInviteOrg('');
      }, 1200);
    }, 900);
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <div className="rounded-2xl p-4 mb-6 bg-gradient-to-r from-neon-red/15 via-neon-amber/10 to-neon-purple/10 border border-neon-amber/30 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-amber/20 to-neon-red/20 border border-neon-amber/30 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-neon-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-neon-amber mb-0.5 flex items-center gap-2">ADMIN ONLY · User Management Console</h2>
            <p className="text-sm text-muted-foreground">Sensitive operations below — role changes, impersonation and deletion are logged permanently.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30">
                <Users className="w-6 h-6 text-neon-purple" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold mb-0.5">
                  <span className="gradient-text">User Management</span>
                </h1>
                <p className="text-muted-foreground text-sm">Manage roles, access and platform users</p>
              </div>
            </div>
          </div>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="neon-btn !rounded-xl" onClick={() => setInviteOpen(true)}>
                <UserPlus className="w-4 h-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-neon-purple" />Invite New User</DialogTitle>
                <DialogDescription>An email invitation with a secure onboarding link will be sent immediately.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Email Address</Label>
                  <Input type="email" className="mt-2" placeholder="colleague@research.in" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                </div>
                <div>
                  <Label>Role</Label>
                  <select className="neon-input mt-2" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as UserRole)}>
                    <option value="student">Student</option>
                    <option value="guest">Guest</option>
                    <option value="researcher">Researcher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <Label>Organization (optional)</Label>
                  <Input className="mt-2" placeholder="Indian Institute of Science" value={inviteOrg} onChange={(e) => setInviteOrg(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="glass" onClick={() => setInviteOpen(false)} disabled={sending}>Cancel</Button>
                <Button onClick={sendInvite} disabled={sending || !inviteEmail}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? <><Save className="w-4 h-4 text-neon-green" />Sent!</> : <><Mail className="w-4 h-4" />Send Invite</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <GlassPanel>
          <div className="mb-5 space-y-3">
            <Tabs value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}>
              <TabsList className="flex-wrap h-auto !rounded-xl p-1.5">
                <TabsTrigger value="all" className="gap-1.5 h-9"><Filter className="w-3.5 h-3.5" />All <Badge variant="outline" className="!text-[10px] !py-0 !ml-1">{counts.all}</Badge></TabsTrigger>
                <TabsTrigger value="admin" className="gap-1.5 h-9"><Crown className="w-3.5 h-3.5" />Admins <Badge variant="danger" className="!text-[10px] !py-0 !ml-1">{counts.admin}</Badge></TabsTrigger>
                <TabsTrigger value="researcher" className="gap-1.5 h-9"><UserCheck className="w-3.5 h-3.5" />Researchers <Badge variant="info" className="!text-[10px] !py-0 !ml-1">{counts.researcher}</Badge></TabsTrigger>
                <TabsTrigger value="student" className="gap-1.5 h-9"><Users className="w-3.5 h-3.5" />Students <Badge variant="success" className="!text-[10px] !py-0 !ml-1">{counts.student}</Badge></TabsTrigger>
                <TabsTrigger value="guest" className="gap-1.5 h-9"><Users className="w-3.5 h-3.5" />Guests <Badge variant="outline" className="!text-[10px] !py-0 !ml-1">{counts.guest}</Badge></TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="!pl-10" placeholder="Search name, email, org…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select className="neon-input sm:w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-3 py-3 font-medium" colSpan={2}>User</th>
                  <th className="px-3 py-3 font-medium">Role</th>
                  <th className="px-3 py-3 font-medium">Organization</th>
                  <th className="px-3 py-3 font-medium">Joined</th>
                  <th className="px-3 py-3 font-medium">Last Login</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const RoleIcon = ROLE_ICON[u.role];
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-3 py-3.5 w-[52px]">
                        <Avatar src={u.avatar} name={u.name} />
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3" />{u.email}
                        </p>
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge variant={ROLE_VARIANT[u.role]} className="!text-xs !px-2.5 capitalize">
                          <RoleIcon className="w-3 h-3 mr-1" />{u.role}
                        </Badge>
                      </td>
                      <td className="px-3 py-3.5 text-sm flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[180px]">{u.organization}</span>
                      </td>
                      <td className="px-3 py-3.5 text-sm">
                        <span className="font-mono text-xs flex items-center gap-1.5 text-muted-foreground">
                          <CalendarDays className="w-3 h-3" />{u.createdAt}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-sm">
                        {u.lastLogin ? (
                          <span className="font-mono text-xs flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-3 h-3" />{formatDate(u.lastLogin).split(',')[0]}
                          </span>
                        ) : <span className="text-xs text-muted-foreground/50 italic">Never</span>}
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge variant={u.status === 'active' ? 'success' : 'danger'} className="!text-xs !px-2.5 capitalize">{u.status}</Badge>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button className="h-8 px-3 rounded-lg text-xs hover:bg-white/10 flex items-center gap-1.5 text-muted-foreground hover:text-neon-cyan border border-transparent hover:border-neon-cyan/30 transition-all">
                            <Edit3 className="w-3.5 h-3.5" />Edit
                          </button>
                          <button className="h-8 px-3 rounded-lg text-xs hover:bg-neon-purple/10 flex items-center gap-1.5 text-muted-foreground hover:text-neon-purple border border-transparent hover:border-neon-purple/30 transition-all">
                            <UserCheck className="w-3.5 h-3.5" />Impersonate
                          </button>
                          <button className="w-8 h-8 rounded-lg hover:bg-neon-red/10 flex items-center justify-center text-muted-foreground hover:text-neon-red transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-5 pt-5 border-t border-white/10">
            <span>Showing {filtered.length} of {USERS.length} users</span>
            <div className="flex items-center gap-1">
              <Button variant="glass" size="sm" disabled>← Prev</Button>
              <Badge variant="info" className="!text-[10px] !px-2.5">Page 1</Badge>
              <Button variant="glass" size="sm">Next →</Button>
            </div>
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
