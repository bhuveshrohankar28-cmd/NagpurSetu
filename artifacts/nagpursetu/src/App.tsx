import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Bell,
  BellRing,
  BusFront,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Droplets,
  Factory,
  FileText,
  Flame,
  HeartPulse,
  Home as HomeIcon,
  Hospital,
  Info,
  Lightbulb,
  LocateFixed,
  MapPin,
  MessageCircle,
  MessageSquarePlus,
  Phone,
  Pill,
  Plus,
  Radio,
  Route as RouteIcon,
  Save,
  Shield,
  Siren,
  Star,
  Trash2,
  TriangleAlert,
  UserRound,
  Vote,
  Volume2,
  VolumeX,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type Ticket = {
  id: string;
  category: string;
  location: string;
  status: string;
  detail: string;
  tone: 'teal' | 'amber' | 'coral';
  department?: string;
  description?: string;
  attachments?: string[];
};
type Idea = {
  id: number;
  title: string;
  body: string;
  author: string;
  votes: number;
  status: string;
  color: string;
};
type Stats = {
  complaintsResolved: number;
  garbageVehiclesActive: number;
  potholesRepaired: number;
  waterLeaksFixed: number;
  civicProjectsCompleted: number;
};
type TrustedContact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  channel: 'Call' | 'SMS' | 'WhatsApp';
};
type Profile = {
  name: string;
  age: string;
  phone: string;
  gender: string;
  address: string;
  bloodGroup: string;
  medicalNotes: string;
  contacts: TrustedContact[];
};
type AppNotification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  tone: 'teal' | 'amber' | 'coral';
};
type Notify = (
  title: string,
  detail: string,
  tone?: AppNotification['tone'],
) => void;

const defaultProfile: Profile = {
  name: 'Bhuvesh Rohankar',
  age: '28',
  phone: '+91 98220 44118',
  gender: 'male',
  address: 'Dharampeth, Nagpur',
  bloodGroup: 'A+',
  medicalNotes:
    'Asthma inhaler in blue pouch. Please contact family before hospital admission.',
  contacts: [
    {
      id: 'rohan',
      name: 'Rohan Patil',
      relation: 'Brother',
      phone: '+91 98220 44118',
      channel: 'WhatsApp',
    },
    {
      id: 'meera',
      name: 'Meera Patil',
      relation: 'Mother',
      phone: '+91 93701 22408',
      channel: 'Call',
    },
  ],
};

const initialNotifications: AppNotification[] = [
  {
    id: 'nmc-resolved',
    title: 'NMC-SAN-0850 was resolved',
    detail: 'Commercial waste accumulation at Sitabuldi Main Market was cleaned.',
    time: '1 hour ago',
    read: false,
    tone: 'teal',
  },
  {
    id: 'potholes',
    title: '8 potholes repaired today',
    detail: 'Nagpur Today has been updated from the NMC Central Feed.',
    time: '2 mins ago',
    read: false,
    tone: 'amber',
  },
  {
    id: 'metro',
    title: 'Metro lines are on time',
    detail: 'Orange and Aqua lines are running every 6 minutes.',
    time: '5 mins ago',
    read: true,
    tone: 'teal',
  },
];

const initialTickets: Ticket[] = [
  {
    id: 'NMC-SAN-1042',
    category: 'Overflowing Garbage Dump',
    location: 'Shankar Nagar Square, Dharampeth',
    status: 'Dispatched to Zone 2 Sanitation Van #MH-31-AZ-1042',
    detail: 'ETA · 45 mins',
    tone: 'amber',
  },
  {
    id: 'NMC-SAN-0988',
    category: 'Missed Door-to-Door Pickup',
    location: 'Bajaj Nagar, Zone 3',
    status: 'Under Review by Zonal Health Officer',
    detail: 'ETA · Today, 2:00 PM',
    tone: 'coral',
  },
  {
    id: 'NMC-SAN-0850',
    category: 'Commercial Waste Accumulation',
    location: 'Sitabuldi Main Market',
    status: 'Resolved & Cleaned',
    detail: 'Completed · 1 hour ago',
    tone: 'teal',
  },
];

const initialIdeas: Idea[] = [
  {
    id: 1,
    title:
      'EV feeder auto stands at Sitabuldi & Rahate Colony Metro interchanges',
    body: 'Create visible, reliable auto stands at the busiest metro interchanges so the last mile is easier for everyone.',
    author: 'Aarav Sharma',
    votes: 42,
    status: 'Under NMC Review',
    color: 'teal',
  },
  {
    id: 2,
    title:
      'Solar tree canopies with USB charging around Futala Lake promenade',
    body: 'Shade, clean energy and a small place to recharge while people enjoy one of Nagpur’s most loved public spaces.',
    author: 'Pooja Deshmukh',
    votes: 29,
    status: 'Shortlisted',
    color: 'saffron',
  },
  {
    id: 3,
    title:
      'Smart QR-coded segregation bins for Dharampeth weekly vegetable market',
    body: 'Simple guidance at the point of disposal can make clean segregation feel natural for vendors and visitors.',
    author: 'Nikhil Kulkarni',
    votes: 19,
    status: 'Open for Voting',
    color: 'coral',
  },
];

function getStoredProfile(): Profile {
  if (typeof window === 'undefined') return defaultProfile;
  try {
    const stored = window.localStorage.getItem('nagpursetu-profile');
    if (!stored) return defaultProfile;
    const parsed = JSON.parse(stored) as Partial<Profile>;
    return {
      ...defaultProfile,
      ...parsed,
      contacts:
        parsed.contacts && parsed.contacts.length
          ? (parsed.contacts as TrustedContact[])
          : defaultProfile.contacts,
    };
  } catch {
    return defaultProfile;
  }
}

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'NS'
  );
}

function googleMapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query}, Nagpur, Maharashtra`)}`;
}

function MapsButton({ query }: { query: string }) {
  return (
    <a
      href={googleMapsUrl(query)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-xl bg-[hsl(var(--primary)/.1)] px-3 py-2 text-xs font-bold text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--primary)/.18)]"
      data-testid={`link-map-${query.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
    >
      <MapPin size={14} /> Open in Google Maps
    </a>
  );
}

function IconMark() {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] shadow-sm">
      <span className="display text-[22px] font-800">न</span>
      <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
    </div>
  );
}

function Button({
  children,
  className = '',
  variant = 'primary',
  onClick,
  type = 'button',
  disabled,
  testId,
}: {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'soft' | 'outline' | 'danger' | 'ghost';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  testId?: string;
}) {
  const styles = {
    primary:
      'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:brightness-110',
    soft: 'bg-[hsl(var(--secondary)/.28)] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary)/.48)]',
    outline:
      'border border-[hsl(var(--border))] bg-[hsl(var(--card)/.5)] hover:bg-[hsl(var(--muted))]',
    danger: 'bg-[hsl(var(--destructive))] text-white hover:brightness-110',
    ghost: 'hover:bg-[hsl(var(--muted))]',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      data-testid={testId}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Tag({
  children,
  tone = 'teal',
}: {
  children: ReactNode;
  tone?: 'teal' | 'amber' | 'coral' | 'slate';
}) {
  const map = {
    teal: 'bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]',
    amber: 'bg-[hsl(var(--secondary)/.3)] text-[hsl(31_58%_34%)]',
    coral: 'bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]',
    slate: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${map[tone]}`}
    >
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <div className="mono mb-2 text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">
            {eyebrow}
          </div>
        )}
        <h2 className="display text-xl font-700 tracking-tight sm:text-2xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[hsl(var(--foreground)/.42)] p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-h-[92dvh] w-full overflow-auto rounded-t-[25px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-2xl sm:rounded-[25px] ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="display text-xl font-700">{title}</h2>
          <button
            onClick={onClose}
            data-testid="button-close-modal"
            className="rounded-full p-2 hover:bg-[hsl(var(--muted))]"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function NotificationsPanel({
  notifications,
  onMarkAllRead,
}: {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
}) {
  return (
    <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-left shadow-2xl">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
        <div>
          <div className="display text-base font-800">City desk updates</div>
          <div className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
            Accomplishments and safety activity
          </div>
        </div>
        <button
          onClick={onMarkAllRead}
          className="text-[11px] font-bold text-[hsl(var(--primary))] hover:underline"
        >
          Mark all read
        </button>
      </div>
      <div className="max-h-[360px] overflow-auto">
        {notifications.length ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex gap-3 border-b border-[hsl(var(--border))] p-4 last:border-0 ${notification.read ? 'opacity-60' : ''}`}
            >
              <div
                className={`mt-0.5 rounded-xl p-2 ${
                  notification.tone === 'coral'
                    ? 'bg-[hsl(var(--accent)/.14)] text-[hsl(var(--accent))]'
                    : notification.tone === 'amber'
                      ? 'bg-[hsl(var(--secondary)/.28)] text-[hsl(31_58%_34%)]'
                      : 'bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]'
                }`}
              >
                {notification.tone === 'coral' ? (
                  <BellRing size={15} />
                ) : (
                  <CheckCircle2 size={15} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">{notification.title}</div>
                <div className="mt-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {notification.detail}
                </div>
                <div className="mono mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                  {notification.time}
                </div>
              </div>
              {!notification.read && (
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--accent))]" />
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <Bell
              className="mx-auto mb-2 text-[hsl(var(--muted-foreground))]"
              size={20}
            />
            <div className="text-sm font-bold">You’re all caught up</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Shell({
  children,
  page,
  profile,
  notifications,
  onMarkAllRead,
}: {
  children: ReactNode;
  page: string;
  profile: Profile;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
}) {
  const [language, setLanguage] = useState<'en' | 'mr' | 'hi'>('en');
  const [quickOpen, setQuickOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const links = [
    { href: '/', key: 'overview', label: 'Overview', icon: HomeIcon },
    { href: '/emergency', key: 'emergency', label: 'Emergency', icon: Siren },
    { href: '/services', key: 'services', label: 'Services', icon: Hospital },
    {
      href: '/grievances',
      key: 'grievances',
      label: 'My grievances',
      icon: FileText,
    },
    { href: '/ideas', key: 'ideas', label: '2047 ideas', icon: Lightbulb },
  ];
  const translations: Record<'en' | 'mr' | 'hi', Record<string, string>> = {
    en: {
      overview: 'Overview',
      emergency: 'Emergency',
      services: 'Services',
      grievances: 'My grievances',
      ideas: '2047 ideas',
    },
    mr: {
      overview: 'आढावा',
      emergency: 'आपत्कालीन',
      services: 'सेवा',
      grievances: 'माझ्या तक्रारी',
      ideas: '२०४७ कल्पना',
    },
    hi: {
      overview: 'अवलोकन',
      emergency: 'आपातकाल',
      services: 'सेवाएँ',
      grievances: 'मेरी शिकायतें',
      ideas: '२०४७ विचार',
    },
  };
  const cycleLanguage = () =>
    setLanguage((current) =>
      current === 'en' ? 'mr' : current === 'mr' ? 'hi' : 'en',
    );
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="grain min-h-[100dvh] bg-[hsl(var(--background))]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col bg-[hsl(var(--sidebar))] px-5 py-6 text-[hsl(var(--sidebar-foreground))] md:flex">
        <div className="mb-12 flex items-center gap-3">
          <IconMark />
          <div>
            <div className="display text-lg font-800 tracking-tight">NagpurSetu</div>
            <div className="text-[10px] uppercase tracking-[.16em] opacity-55">
              Your city, connected
            </div>
          </div>
        </div>
        <div className="mono mb-3 px-3 text-[10px] uppercase tracking-[.15em] opacity-45">
          City desk
        </div>
        <nav className="space-y-1">
          {links.map(({ href, key, icon: Icon }) => (
            <Link
              href={href}
              key={href}
              data-testid={`link-${key}`}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                page === href
                  ? 'bg-[hsl(var(--sidebar-accent))] font-bold text-[hsl(var(--sidebar-accent-foreground))]'
                  : 'opacity-70 hover:bg-[hsl(var(--sidebar-accent)/.55)] hover:opacity-100'
              }`}
            >
              <Icon size={18} strokeWidth={page === href ? 2.5 : 1.8} />
              <span>{translations[language][key]}</span>
              {href === '/emergency' && (
                <span className="ml-auto h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.5)] p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold">
            <Radio size={14} className="text-[hsl(var(--sidebar-primary))]" />
            NMC CENTRAL FEED
          </div>
          <p className="text-xs leading-relaxed opacity-65">
            Live civic updates from across Nagpur. Last synced 2 mins ago.
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.86)] px-4 backdrop-blur-xl md:ml-[248px] md:px-10">
        <div className="flex items-center gap-3 md:hidden">
          <IconMark />
          <span className="display font-800">NagpurSetu</span>
        </div>
        <div className="hidden items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] md:flex">
          <MapPin size={16} className="text-[hsl(var(--primary))]" />
          Nagpur, Maharashtra
          <span className="mx-2 opacity-30">/</span>
          <span className="font-semibold text-[hsl(var(--foreground))]">
            {page === '/login'
              ? 'Your profile'
              : translations[language][
                  links.find((link) => link.href === page)?.key ?? 'overview'
                ]}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={cycleLanguage}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)] px-2 py-1 text-[10px] font-bold sm:hidden"
            aria-label="Change language"
          >
            {language === 'en' ? 'EN' : language === 'mr' ? 'मराठी' : 'हिंदी'}
          </button>
          <div
            className="hidden items-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)] p-1 sm:flex"
            aria-label="Language selector"
          >
            {(['en', 'mr', 'hi'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setLanguage(item)}
                aria-pressed={language === item}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                  language === item
                    ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                }`}
              >
                {item === 'en' ? 'EN' : item === 'mr' ? 'मराठी' : 'हिंदी'}
              </button>
            ))}
          </div>
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((value) => !value)}
              data-testid="button-notifications"
              className="relative rounded-xl p-2.5 hover:bg-[hsl(var(--muted))]"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--accent))] px-1 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <NotificationsPanel
                notifications={notifications}
                onMarkAllRead={() => {
                  onMarkAllRead();
                  setNotificationsOpen(false);
                }}
              />
            )}
          </div>
          <div className="hidden h-8 w-px bg-[hsl(var(--border))] sm:block" />
          <Link href="/login" className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[hsl(var(--muted))]" data-testid="link-profile">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]">
              {getInitials(profile.name)}
            </div>
            <span className="hidden text-sm font-bold sm:inline">{profile.name}</span>
          </Link>
        </div>
      </header>

      <main className="ml-0 pb-24 md:ml-[248px] md:pb-10">{children}</main>

      <div className="fixed bottom-[84px] right-4 z-30 md:bottom-6 md:right-6">
        <div
          className={`mb-2 overflow-hidden rounded-2xl border border-[hsl(var(--primary)/.3)] bg-[hsl(var(--card)/.97)] p-2 shadow-xl transition-all ${
            quickOpen
              ? 'w-[250px] opacity-100'
              : 'pointer-events-none h-0 w-0 p-0 opacity-0'
          }`}
        >
          <div className="flex items-center justify-between px-2 pb-1.5">
            <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--primary))]">
              Close ones
            </div>
            <Tag>{profile.contacts.length} saved</Tag>
          </div>
          {profile.contacts.length ? (
            profile.contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-[hsl(var(--muted))]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--secondary)/.35)] text-xs font-bold">
                  {getInitials(contact.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold">{contact.name}</div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {contact.relation} · {contact.channel}
                  </div>
                </div>
                <a
                  href={`tel:${contact.phone.replaceAll(' ', '').replaceAll('-', '')}`}
                  className="rounded-lg p-2 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.12)]"
                  aria-label={`Call ${contact.name}`}
                >
                  <Phone size={15} />
                </a>
                <a
                  href={`sms:${contact.phone.replaceAll(' ', '').replaceAll('-', '')}?body=${encodeURIComponent(`Hi ${contact.name}, I need help. This is ${profile.name} from Nagpur.`)}`}
                  className="rounded-lg p-2 text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/.12)]"
                  aria-label={`Message ${contact.name}`}
                >
                  <MessageCircle size={15} />
                </a>
              </div>
            ))
          ) : (
            <div className="p-3 text-xs text-[hsl(var(--muted-foreground))]">
              Add trusted contacts to reach close ones quickly.
            </div>
          )}
          <Link
            href="/login"
            onClick={() => setQuickOpen(false)}
            className="mt-1 flex items-center justify-center gap-1 rounded-xl bg-[hsl(var(--muted))] p-2 text-xs font-bold"
          >
            Manage trusted contacts <ChevronRight size={13} />
          </Link>
        </div>
        <button
          onClick={() => setQuickOpen((value) => !value)}
          aria-expanded={quickOpen}
          aria-label="Open trusted contacts"
          data-testid="button-close-ones"
          className="flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
        >
          <MessageCircle size={17} /> Close ones
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-[72px] items-center justify-around border-t border-[hsl(var(--border))] bg-[hsl(var(--card)/.94)] px-2 backdrop-blur-xl md:hidden">
        {links.map(({ href, key, icon: Icon }) => (
          <Link
            href={href}
            key={href}
            className={`flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold ${
              page === href
                ? 'text-[hsl(var(--primary))]'
                : 'text-[hsl(var(--muted-foreground))]'
            }`}
          >
            <Icon size={19} />
            <span>
              {language === 'en' && key === 'grievances'
                ? 'Grievances'
                : translations[language][key]}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function LiveImpact({ stats }: { stats: Stats }) {
  const items = [
    { label: 'Complaints resolved', value: stats.complaintsResolved, icon: Check, tone: 'teal' },
    { label: 'Waste vehicles active', value: stats.garbageVehiclesActive, icon: Trash2, tone: 'amber' },
    { label: 'Potholes repaired', value: stats.potholesRepaired, icon: RouteIcon, tone: 'coral' },
    { label: 'Water leaks fixed', value: stats.waterLeaksFixed, icon: Droplets, tone: 'teal' },
    { label: 'Projects completed', value: stats.civicProjectsCompleted, icon: Factory, tone: 'amber' },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {items.map(({ label, value, icon: Icon, tone }, index) => (
        <div
          key={label}
          className={`animate-rise delay-${index + 1} rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.72)] p-3.5 card-shadow`}
        >
          <div className="mb-4 flex items-center justify-between">
            <Icon
              size={16}
              className={
                tone === 'teal'
                  ? 'text-[hsl(var(--primary))]'
                  : tone === 'amber'
                    ? 'text-[hsl(32_65%_43%)]'
                    : 'text-[hsl(var(--accent))]'
              }
            />
            <span className="mono text-[10px] text-[hsl(var(--muted-foreground))]">TODAY</span>
          </div>
          <div
            data-testid={`stat-${label.toLowerCase().replaceAll(' ', '-')}`}
            className="display text-2xl font-800"
          >
            {value}
          </div>
          <div className="mt-1 text-[11px] leading-tight text-[hsl(var(--muted-foreground))]">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

function SosModal({
  onClose,
  profile,
  onNotify,
}: {
  onClose: () => void;
  profile: Profile;
  onNotify: Notify;
}) {
  const [siren, setSiren] = useState(false);
  const [location, setLocation] = useState('Location will be attached if permission is granted');
  const [sent, setSent] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);

  const stopSiren = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    const context = audioContextRef.current;
    const gain = gainRef.current;
    const oscillator = oscillatorRef.current;
    if (context && gain) {
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.setTargetAtTime(0.0001, context.currentTime, 0.04);
    }
    if (oscillator && context) {
      try {
        oscillator.stop(context.currentTime + 0.1);
      } catch {
        // The oscillator may already be stopped by the browser.
      }
    }
    oscillatorRef.current = null;
    gainRef.current = null;
  };

  useEffect(() => () => stopSiren(), []);

  const startSiren = () => {
    try {
      const windowWithWebkit = window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioContextConstructor =
        window.AudioContext ?? windowWithWebkit.webkitAudioContext;
      if (!AudioContextConstructor) return false;
      const context =
        audioContextRef.current ?? new AudioContextConstructor();
      audioContextRef.current = context;
      void context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 560;
      gain.gain.value = 0.09;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillatorRef.current = oscillator;
      gainRef.current = gain;
      let high = false;
      timerRef.current = window.setInterval(() => {
        high = !high;
        oscillator.frequency.setTargetAtTime(
          high ? 860 : 460,
          context.currentTime,
          0.06,
        );
      }, 280);
      return true;
    } catch {
      return false;
    }
  };

  const toggleSiren = () => {
    if (siren) {
      stopSiren();
      setSiren(false);
      return;
    }
    if (startSiren()) {
      setSiren(true);
      onNotify(
        'Emergency sound enabled',
        'The siren and screen strobe deterrent are active.',
        'coral',
      );
    }
  };

  const send = (silent = false) => {
    const openMessage = (coordinates: string) => {
      const trustedNames = profile.contacts.map((contact) => contact.name).join(', ');
      const message = `SOS from ${profile.name}, Nagpur. My location: ${coordinates}. Please call me immediately. Trusted contacts: ${trustedNames || 'please call back'}.`;
      if (!silent) window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
      setLocation(coordinates);
      setSent(true);
      onNotify(
        silent ? 'Silent SOS prepared' : 'Broadcast SOS prepared',
        silent
          ? 'Your discreet alert is ready for trusted contacts.'
          : 'An emergency message with your location is ready to send.',
        'coral',
      );
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          openMessage(
            `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`,
          ),
        () => openMessage('Location unavailable — please call me immediately'),
      );
    } else {
      openMessage('Location unavailable — please call me immediately');
    }
  };

  return (
    <Modal title="Safety tools" onClose={onClose}>
      <div className="space-y-3">
        <div className="rounded-2xl bg-[hsl(var(--destructive)/.1)] p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[hsl(var(--destructive))] p-2 text-white">
              <Siren size={20} />
            </div>
            <div>
              <div className="font-bold">Need immediate help?</div>
              <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                {profile.contacts.length
                  ? `Your trusted contacts — ${profile.contacts.map((contact) => contact.name).join(' and ')} — are ready to reach.`
                  : 'Add trusted contacts to share an alert with people close to you.'}
              </p>
            </div>
          </div>
        </div>
        {sent && (
          <div className="rounded-xl bg-[hsl(var(--primary)/.1)] p-3 text-sm font-semibold text-[hsl(var(--primary))]">
            <Check size={15} className="mr-1 inline" /> SOS message prepared. Stay with someone you trust.
            <div className="mt-1 text-xs font-normal opacity-80">{location}</div>
          </div>
        )}
        <Button
          variant="danger"
          className="w-full py-3.5"
          onClick={() => send()}
          testId="button-broadcast-sos"
        >
          <Radio size={18} /> Broadcast SOS
        </Button>
        <Button
          variant="soft"
          className="w-full"
          onClick={() => send(true)}
          testId="button-silent-sos"
        >
          <Shield size={17} /> Silent / camouflage SOS
        </Button>
        <button
          onClick={toggleSiren}
          data-testid="button-siren-toggle"
          className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
            siren
              ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.1)]'
              : 'border-[hsl(var(--border))]'
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            {siren ? <Volume2 size={17} /> : <VolumeX size={17} />}
            {siren ? 'Stop siren & strobe' : 'Siren & strobe deterrent'}
          </span>
          <span
            className={`h-6 w-11 rounded-full p-1 ${
              siren ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--muted))]'
            }`}
          >
            <span
              className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                siren ? 'translate-x-5' : ''
              }`}
            />
          </span>
        </button>
        {siren && (
          <div className="strobe rounded-xl bg-[hsl(var(--accent)/.15)] p-3 text-center text-xs font-bold text-[hsl(var(--accent))]">
            Deterrent mode active · sound enabled
          </div>
        )}
        <Link
          href="/login"
          onClick={onClose}
          className="flex items-center justify-center gap-2 pt-2 text-sm font-bold text-[hsl(var(--primary))]"
        >
          Update profile & trusted contacts <ChevronRight size={16} />
        </Link>
      </div>
    </Modal>
  );
}

function MedicalModal({
  onClose,
  profile,
}: {
  onClose: () => void;
  profile: Profile;
}) {
  return (
    <Modal title="Medical Emergency ID" onClose={onClose}>
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.55)] p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-xl font-bold text-white">
            {profile.bloodGroup || '—'}
          </div>
          <div>
            <div className="display text-lg font-800">{profile.name || 'Your name'}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">
              {profile.age ? `${profile.age} years` : 'Age not added'} · {profile.gender || 'Gender not added'}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Blood group</div>
            <strong>{profile.bloodGroup || 'Not added'}</strong>
          </div>
          <div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Phone</div>
            <strong>{profile.phone || 'Not added'}</strong>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Residential address</div>
            <strong>{profile.address || 'Not added'}</strong>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Emergency contacts</div>
            <div className="mt-1 space-y-1">
              {profile.contacts.length ? (
                profile.contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between gap-2">
                    <strong>{contact.name} · {contact.phone}</strong>
                    <a href={`tel:${contact.phone.replaceAll(' ', '').replaceAll('-', '')}`} className="text-[hsl(var(--primary))]" aria-label={`Call ${contact.name}`}>
                      <Phone size={14} />
                    </a>
                  </div>
                ))
              ) : (
                <strong>Add a trusted contact in your profile</strong>
              )}
            </div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Notes for responders</div>
            <strong>{profile.medicalNotes || 'No medical notes added.'}</strong>
          </div>
        </div>
      </div>
      <Button className="mt-4 w-full" onClick={onClose} testId="button-confirm-medical-id">
        <Check size={16} /> Got it
      </Button>
    </Modal>
  );
}

function GrievanceModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (
    category: string,
    location: string,
    description: string,
    department: string,
    attachments: string[],
  ) => void;
}) {
  const [category, setCategory] = useState('Overflowing Garbage Dump');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('NMC Sanitation Department');
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!location.trim() || !description.trim()) return;
    onSubmit(
      category === 'custom' ? 'Resident-submitted civic report' : category,
      location,
      description,
      department,
      files.map((file) => file.name),
    );
    setSubmitted(true);
  };
  return (
    <Modal title="Report a civic issue" onClose={onClose}>
      {submitted ? (
        <div className="py-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary)/.13)] text-[hsl(var(--primary))]">
            <Check size={30} />
          </div>
          <h3 className="display text-xl font-800">Report received</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-[hsl(var(--muted-foreground))]">
            Your ticket is now in the tracker. We’ll keep the city desk on it.
          </p>
          <Button className="mt-5" onClick={onClose} testId="button-close-success">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-bold">
            What needs attention?
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              data-testid="select-grievance-category"
              className="mt-2 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              <option>Overflowing Garbage Dump</option>
              <option>Missed Door-to-Door Pickup</option>
              <option>Commercial Waste Accumulation</option>
              <option>Water leak</option>
              <option>Pothole</option>
              <option value="custom">Other / write my own report</option>
            </select>
          </label>
          <label className="block text-sm font-bold">
            Describe the issue in your own words
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell the department what happened, what you saw, and why it needs attention."
              data-testid="textarea-grievance-description"
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </label>
          <label className="block text-sm font-bold">
            Where is it?
            <div className="relative mt-2">
              <MapPin size={17} className="absolute left-3 top-3.5 text-[hsl(var(--muted-foreground))]" />
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Street, landmark or ward"
                data-testid="input-grievance-location"
                className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>
          </label>
          <label className="block text-sm font-bold">
            Send this to
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              data-testid="select-grievance-department"
              className="mt-2 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              <option>NMC Sanitation Department</option>
              <option>NMC Water Works Department</option>
              <option>Nagpur Traffic Police</option>
              <option>Nagpur Metro Rail</option>
            </select>
          </label>
          <label className="block cursor-pointer rounded-xl border border-dashed border-[hsl(var(--primary)/.45)] bg-[hsl(var(--primary)/.05)] p-4 text-sm font-bold transition hover:bg-[hsl(var(--primary)/.1)]">
            <span className="flex items-center gap-2 text-[hsl(var(--primary))]">
              <Plus size={17} /> Attach photos or videos
            </span>
            <span className="mt-1 block text-xs font-normal text-[hsl(var(--muted-foreground))]">
              Share visual evidence with the selected government department. Multiple files supported.
            </span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 6))}
              data-testid="input-grievance-media"
              className="sr-only"
            />
          </label>
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={`${file.name}-${file.lastModified}`}
                  className="flex items-center gap-2 rounded-lg bg-[hsl(var(--muted)/.55)] px-3 py-2 text-xs"
                >
                  <FileText size={14} className="text-[hsl(var(--primary))]" />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((current) =>
                        current.filter(
                          (item) =>
                            item.name !== file.name ||
                            item.lastModified !== file.lastModified,
                        ),
                      )
                    }
                    className="rounded p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--background))]"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="rounded-xl bg-[hsl(var(--muted)/.55)] p-3 text-xs text-[hsl(var(--muted-foreground))]">
            <Info size={14} className="mr-1 inline text-[hsl(var(--primary))]" />
            Your description and attached media will be included in the department handoff.
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!location.trim() || !description.trim()}
            testId="button-submit-grievance"
          >
            <MessageSquarePlus size={17} /> Create report
          </Button>
        </form>
      )}
    </Modal>
  );
}

function Home({
  stats,
  tickets,
  profile,
  onSubmit,
  onNotify,
}: {
  stats: Stats;
  tickets: Ticket[];
  profile: Profile;
  onSubmit: (
    category: string,
    location: string,
    description: string,
    department: string,
    attachments: string[],
  ) => void;
  onNotify: Notify;
}) {
  const [sos, setSos] = useState(false);
  const [report, setReport] = useState(false);
  const neighborhood = profile.address.split(',')[0] || profile.address;
  return (
    <>
      <div className="mx-auto max-w-[1340px] px-4 py-8 sm:px-7 md:px-10 md:py-12">
        <div className="mb-9 grid gap-8 lg:grid-cols-[1fr_390px] lg:items-end">
          <div className="animate-rise">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary)/.1)] px-3 py-1.5 text-xs font-bold text-[hsl(var(--primary))]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[hsl(var(--primary))]" />
              Live from NMC Central Feed
            </div>
            <h1 className="display max-w-3xl text-[clamp(2.6rem,6vw,5.5rem)] font-800 leading-[.98] tracking-[-.06em]">
              {profile.name ? `Hi ${profile.name.split(' ')[0]},` : 'Nagpur,'}
              <br />
              <span className="text-[hsl(var(--primary))]">we’ve got you.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[hsl(var(--muted-foreground))]">
              A calm, connected way to find help, see progress and shape the city we’re building together.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Button onClick={() => setSos(true)} variant="danger" testId="button-open-sos">
                <Siren size={17} /> I need help now
              </Button>
              <Button onClick={() => setReport(true)} variant="outline" testId="button-open-report">
                <MessageSquarePlus size={17} /> Report an issue
              </Button>
            </div>
          </div>
          <div className="animate-rise delay-2 relative overflow-hidden rounded-[25px] bg-[hsl(var(--sidebar))] p-6 text-[hsl(var(--sidebar-foreground))] card-shadow">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[20px] border-[hsl(var(--sidebar-primary)/.18)]" />
            <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full border-[25px] border-[hsl(var(--sidebar-primary)/.12)]" />
            <div className="relative">
              <div className="mono mb-5 text-[10px] uppercase tracking-[.18em] text-[hsl(var(--sidebar-primary))]">
                Thursday · 20 June 2024
              </div>
              <div className="display text-4xl font-800">
                28° <span className="text-base font-medium opacity-55">clear skies</span>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm opacity-75">
                <LocateFixed size={15} /> Your neighbourhood · {neighborhood}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-[10px] uppercase opacity-50">Air quality</div>
                  <div className="mt-1 font-bold text-[hsl(var(--sidebar-primary))]">Good · 61</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-[10px] uppercase opacity-50">Metro status</div>
                  <div className="mt-1 font-bold text-[hsl(var(--sidebar-primary))]">On time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <section className="animate-rise delay-2">
          <SectionHeading
            eyebrow="The city at a glance"
            title="Nagpur Today"
            action={<span className="mono text-[10px] text-[hsl(var(--muted-foreground))]">UPDATED 2 MINS AGO</span>}
          />
          <LiveImpact stats={stats} />
        </section>
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <section className="animate-rise delay-3">
            <SectionHeading eyebrow="Quick access" title="Help is closer than you think" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/emergency" data-testid="card-emergency" className="group flex min-h-[156px] flex-col justify-between rounded-[22px] bg-[hsl(var(--destructive))] p-5 text-white transition-transform hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-white/15 p-2.5"><Siren size={21} /></div>
                  <ChevronRight size={19} className="opacity-60 transition-transform group-hover:translate-x-1" />
                </div>
                <div>
                  <div className="display text-xl font-800">Emergency & safety</div>
                  <div className="mt-1 text-xs text-white/70">Police · ambulance · fire · SOS</div>
                </div>
              </Link>
              <Link href="/services" data-testid="card-services" className="group flex min-h-[156px] flex-col justify-between rounded-[22px] bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-white/15 p-2.5"><HeartPulse size={21} /></div>
                  <ChevronRight size={19} className="opacity-60 transition-transform group-hover:translate-x-1" />
                </div>
                <div>
                  <div className="display text-xl font-800">Find a service</div>
                  <div className="mt-1 text-xs opacity-70">Hospitals · blood · pharmacy · metro</div>
                </div>
              </Link>
            </div>
          </section>
          <section className="animate-rise delay-4">
            <SectionHeading
              eyebrow="Keep an eye on it"
              title="Your active reports"
              action={<Link href="/grievances" className="text-xs font-bold text-[hsl(var(--primary))]">View all <ChevronRight size={14} className="inline" /></Link>}
            />
            <div className="rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 card-shadow">
              {tickets.slice(0, 2).map((ticket) => (
                <div key={ticket.id} className="flex items-start gap-3 border-b border-[hsl(var(--border))] py-3 last:border-0 last:pb-1 first:pt-1">
                  <div className="mt-0.5 rounded-lg bg-[hsl(var(--muted))] p-2"><Trash2 size={15} className="text-[hsl(var(--primary))]" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-bold">{ticket.category}</div>
                      <Tag tone={ticket.tone}>{ticket.status}</Tag>
                    </div>
                    <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{ticket.id} · {ticket.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <section className="mt-12 rounded-[25px] bg-[hsl(var(--secondary)/.24)] p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mono mb-2 text-[10px] uppercase tracking-[.18em] text-[hsl(var(--accent))]">A city we can pass on</div>
              <h2 className="display max-w-xl text-2xl font-800 sm:text-3xl">What should Nagpur look like in 2047?</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">Ideas from the people who live here. Vote for a future that feels like yours.</p>
            </div>
            <Link href="/ideas" data-testid="link-explore-ideas" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--foreground))] px-5 py-3 text-sm font-bold text-[hsl(var(--background))]">Explore ideas <Lightbulb size={16} /></Link>
          </div>
        </section>
      </div>
      {sos && <SosModal onClose={() => setSos(false)} profile={profile} onNotify={onNotify} />}
      {report && <GrievanceModal onClose={() => setReport(false)} onSubmit={onSubmit} />}
    </>
  );
}

function Emergency({ profile, onNotify }: { profile: Profile; onNotify: Notify }) {
  const [sos, setSos] = useState(false);
  const [medical, setMedical] = useState(false);
  const numbers = [
    { label: 'Police', number: '112', icon: Shield },
    { label: 'Ambulance', number: '108', icon: HeartPulse },
    { label: 'Fire', number: '101', icon: Flame },
    { label: 'Women Helpline', number: '1091', icon: UserRound },
    { label: 'Senior Citizen Support', number: '14567', icon: Phone },
  ];
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-7 md:px-10 md:py-12">
      <div className="mb-9 grid gap-7 lg:grid-cols-[1fr_330px]">
        <div className="animate-rise">
          <Tag tone="coral">Always open · Nagpur</Tag>
          <h1 className="display mt-4 text-4xl font-800 tracking-[-.04em] sm:text-6xl">Help, without<br /><span className="text-[hsl(var(--accent))]">the panic.</span></h1>
          <p className="mt-4 max-w-lg leading-relaxed text-[hsl(var(--muted-foreground))]">Verified numbers, one-tap actions, and safety tools designed for the moments when clear thinking is hardest.</p>
        </div>
        <div className="animate-rise delay-2 rounded-[22px] border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.07)] p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[hsl(var(--destructive))]"><CircleAlert size={17} /> If someone is in immediate danger</div>
          <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">Call the appropriate service first. NagpurSetu’s SOS tools notify trusted help alongside official services.</p>
          <Button className="mt-4 w-full" variant="danger" onClick={() => setSos(true)} testId="button-emergency-sos"><Siren size={17} /> Open SOS tools</Button>
        </div>
      </div>
      <section className="animate-rise delay-2">
        <SectionHeading eyebrow="Official lines" title="Call the right people" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {numbers.map(({ label, number, icon: Icon }) => (
            <a key={number} href={`tel:${number}`} data-testid={`link-call-${number}`} className="group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition hover:-translate-y-1 hover:border-[hsl(var(--primary)/.5)] card-shadow">
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-xl bg-[hsl(var(--muted))] p-2.5 text-[hsl(var(--primary))]"><Icon size={19} /></div>
                <Phone size={15} className="text-[hsl(var(--muted-foreground))] transition group-hover:text-[hsl(var(--primary))]" />
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">{label}</div>
              <div className="mono mt-1 text-xl font-bold">{number}</div>
            </a>
          ))}
        </div>
      </section>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 card-shadow">
          <SectionHeading eyebrow="Ready when you are" title="Your safety kit" />
          <div className="space-y-2">
            <button onClick={() => setMedical(true)} data-testid="button-open-medical-id" className="flex w-full items-center justify-between rounded-xl bg-[hsl(var(--muted)/.62)] p-4 text-left transition hover:bg-[hsl(var(--muted))]">
              <span className="flex items-center gap-3"><div className="rounded-lg bg-[hsl(var(--accent)/.15)] p-2 text-[hsl(var(--accent))]"><HeartPulse size={18} /></div><span><strong className="block text-sm">Medical Emergency ID</strong><small className="text-xs text-[hsl(var(--muted-foreground))]">{profile.bloodGroup || 'Blood group not set'} · {profile.contacts.length} emergency contacts</small></span></span><ChevronRight size={17} />
            </button>
            <button onClick={() => setSos(true)} data-testid="button-open-safety-kit-sos" className="flex w-full items-center justify-between rounded-xl bg-[hsl(var(--muted)/.62)] p-4 text-left transition hover:bg-[hsl(var(--muted))]">
              <span className="flex items-center gap-3"><div className="rounded-lg bg-[hsl(var(--primary)/.15)] p-2 text-[hsl(var(--primary))]"><Radio size={18} /></div><span><strong className="block text-sm">Broadcast trusted-contact SOS</strong><small className="text-xs text-[hsl(var(--muted-foreground))]">With live location when available</small></span></span><ChevronRight size={17} />
            </button>
          </div>
        </section>
        <section className="paper-grid rounded-[22px] border border-[hsl(var(--border))] p-5">
          <div className="mb-6 flex items-center justify-between"><div><div className="mono mb-2 text-[10px] uppercase tracking-[.15em] text-[hsl(var(--primary))]">Know before you go</div><h2 className="display text-xl font-800">Safety notes</h2></div><TriangleAlert className="text-[hsl(var(--secondary))]" /></div>
          <ul className="space-y-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            <li className="flex gap-3"><span className="mono text-xs font-bold text-[hsl(var(--primary))]">01</span> Share your live location with someone you trust before travelling alone.</li>
            <li className="flex gap-3"><span className="mono text-xs font-bold text-[hsl(var(--primary))]">02</span> Keep your Medical ID current. Responders can use it even when you cannot speak.</li>
            <li className="flex gap-3"><span className="mono text-xs font-bold text-[hsl(var(--primary))]">03</span> For a non-urgent civic issue, use My grievances so the city team can track it.</li>
          </ul>
        </section>
      </div>
      {sos && <SosModal onClose={() => setSos(false)} profile={profile} onNotify={onNotify} />}
      {medical && <MedicalModal onClose={() => setMedical(false)} profile={profile} />}
    </div>
  );
}

function ProfilePage({ profile, onSave }: { profile: Profile; onSave: (profile: Profile) => void }) {
  const [draft, setDraft] = useState<Profile>(profile);
  const [saved, setSaved] = useState(false);
  const update = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const updateContact = (
    id: string,
    key: keyof TrustedContact,
    value: string,
  ) =>
    setDraft((current) => ({
      ...current,
      contacts: current.contacts.map((contact) =>
        contact.id === id ? { ...contact, [key]: value } : contact,
      ),
    }));
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-7 md:px-10 md:py-12">
      <div className="mb-9 grid gap-7 lg:grid-cols-[1fr_300px] lg:items-end">
        <div className="animate-rise">
          <Tag tone="amber">Your safety profile</Tag>
          <h1 className="display mt-4 text-4xl font-800 tracking-[-.04em] sm:text-6xl">Make help<br /><span className="text-[hsl(var(--primary))]">more personal.</span></h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">Keep your important details and trusted contacts ready. NagpurSetu uses this information in your Medical ID, SOS message, and quick-contact panel.</p>
        </div>
        <div className="animate-rise delay-2 rounded-[22px] bg-[hsl(var(--sidebar))] p-5 text-[hsl(var(--sidebar-foreground))]">
          <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--sidebar-primary))] text-lg font-800 text-[hsl(var(--sidebar-primary-foreground))]">{getInitials(draft.name)}</div><div><div className="display text-lg font-800">{draft.name || 'Your name'}</div><div className="text-xs opacity-65">{draft.contacts.length} trusted contacts saved</div></div></div>
          <div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white/5 p-3"><div className="text-[10px] uppercase opacity-50">Blood group</div><div className="mt-1 font-bold text-[hsl(var(--sidebar-primary))]">{draft.bloodGroup || 'Not set'}</div></div><div className="rounded-xl bg-white/5 p-3"><div className="text-[10px] uppercase opacity-50">Home area</div><div className="mt-1 truncate font-bold text-[hsl(var(--sidebar-primary))]">{draft.address.split(',')[0] || 'Not set'}</div></div></div>
        </div>
      </div>
      <form onSubmit={save} className="space-y-6">
        <section className="rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 card-shadow sm:p-7">
          <SectionHeading eyebrow="About you" title="Important details" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['name', 'Full name', 'Aditi Patil', 'text'],
              ['age', 'Age', '28', 'number'],
              ['phone', 'Phone number', '+91 98220 44118', 'tel'],
              ['address', 'Residential address', 'Street, area, Nagpur', 'text'],
            ].map(([key, label, placeholder, type]) => (
              <label key={key} className={`block text-sm font-bold ${key === 'address' ? 'sm:col-span-2' : ''}`}>
                {label}
                <input
                  value={draft[key as keyof Profile] as string}
                  onChange={(event) => update(key as keyof Profile, event.target.value as never)}
                  type={type}
                  placeholder={placeholder}
                  required={key === 'name' || key === 'phone'}
                  data-testid={`input-profile-${key}`}
                  className="mt-2 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
              </label>
            ))}
            <label className="block text-sm font-bold">
              Gender
              <select value={draft.gender} onChange={(event) => update('gender', event.target.value)} data-testid="select-profile-gender" className="mt-2 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]">
                <option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Other</option>
              </select>
            </label>
            <label className="block text-sm font-bold">
              Blood group
              <select value={draft.bloodGroup} onChange={(event) => update('bloodGroup', event.target.value)} data-testid="select-profile-blood-group" className="mt-2 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]">
                <option value="">Not added</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group}>{group}</option>)}
              </select>
            </label>
            <label className="block text-sm font-bold sm:col-span-2">
              Medical notes for responders
              <textarea value={draft.medicalNotes} onChange={(event) => update('medicalNotes', event.target.value)} data-testid="textarea-profile-medical-notes" placeholder="Allergies, medication, or anything responders should know" rows={3} className="mt-2 w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
            </label>
          </div>
        </section>
        <section className="rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 card-shadow sm:p-7">
          <SectionHeading eyebrow="Always within reach" title="Trusted emergency contacts" action={<Button variant="soft" onClick={() => setDraft((current) => ({ ...current, contacts: [...current.contacts, { id: `contact-${Date.now()}`, name: '', relation: '', phone: '', channel: 'Call' }] }))}><Plus size={15} /> Add contact</Button>} />
          <div className="space-y-4">
            {draft.contacts.map((contact, index) => (
              <div key={contact.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)] p-4">
                <div className="mb-3 flex items-center justify-between"><div className="text-xs font-bold uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Contact {index + 1}</div>{draft.contacts.length > 1 && <button type="button" onClick={() => setDraft((current) => ({ ...current, contacts: current.contacts.filter((item) => item.id !== contact.id) }))} className="text-xs font-bold text-[hsl(var(--accent))]">Remove</button>}</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-bold">Name<input value={contact.name} onChange={(event) => updateContact(contact.id, 'name', event.target.value)} placeholder="Rohan Patil" data-testid={`input-contact-${index}-name`} className="mt-2 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></label>
                  <label className="text-sm font-bold">Relationship<input value={contact.relation} onChange={(event) => updateContact(contact.id, 'relation', event.target.value)} placeholder="Brother, friend, neighbour" data-testid={`input-contact-${index}-relation`} className="mt-2 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></label>
                  <label className="text-sm font-bold">Phone number<input value={contact.phone} onChange={(event) => updateContact(contact.id, 'phone', event.target.value)} placeholder="+91 90000 00000" data-testid={`input-contact-${index}-phone`} className="mt-2 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></label>
                  <label className="text-sm font-bold">Preferred contact<select value={contact.channel} onChange={(event) => updateContact(contact.id, 'channel', event.target.value)} data-testid={`select-contact-${index}-channel`} className="mt-2 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"><option>Call</option><option>SMS</option><option>WhatsApp</option></select></label>
                </div>
              </div>
            ))}
          </div>
        </section>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {saved && <div className="mr-auto flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]"><CheckCircle2 size={17} /> Profile saved and connected to your safety tools.</div>}
          <Button type="submit" className="px-6" testId="button-save-profile"><Save size={17} /> Save profile</Button>
        </div>
      </form>
    </div>
  );
}

function Services() {
  const [filter, setFilter] = useState('All');
  const [pharmacy, setPharmacy] = useState(false);
  const hospitals = [
    { name: 'GMCH Nagpur', area: 'Medical Square', beds: '8 ICU beds available', phone: '+91-712-2725423', distance: '2.1 km' },
    { name: 'AIIMS Nagpur', area: 'MIHAN', beds: '14 ICU beds available', phone: '+91-712-2811000', distance: '7.4 km' },
    { name: 'Orange City Hospital', area: 'Khamla', beds: '3 ICU beds available', phone: '+91-712-6639800', distance: '3.5 km' },
  ];
  const transit = [
    { name: 'Orange Line', route: 'Khapri ↔ Automotive Square', timing: 'Every 6 mins · Next at Sitabuldi in 3 mins', color: 'bg-[hsl(var(--accent))]', icon: RouteIcon },
    { name: 'Aqua Line', route: 'Lokmanya Nagar ↔ Prajapati Nagar', timing: 'Every 6 mins · Next at Sitabuldi in 5 mins', color: 'bg-[hsl(var(--primary))]', icon: Waves },
    { name: 'Feeder EV · E-4', route: 'Sitabuldi to Civil Lines', timing: 'Departing platform 2 in 4 mins', color: 'bg-[hsl(var(--secondary))]', icon: BusFront },
  ];
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-7 md:px-10 md:py-12">
      <div className="animate-rise mb-10 flex flex-wrap items-end justify-between gap-5"><div><Tag>Verified city services</Tag><h1 className="display mt-4 text-4xl font-800 tracking-[-.04em] sm:text-6xl">Find your<br /><span className="text-[hsl(var(--primary))]">next stop.</span></h1></div><p className="max-w-sm text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">Healthcare, medicine and mobility—clear information to help you move through the city.</p></div>
      <div className="mb-10 flex gap-2 mobile-scroll">{['All', 'Healthcare', 'Medicine', 'Transit'].map((item) => <button key={item} onClick={() => setFilter(item)} data-testid={`button-filter-${item.toLowerCase()}`} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${filter === item ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]' : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]'}`}>{item}</button>)}</div>
      {(filter === 'All' || filter === 'Healthcare') && <section className="animate-rise"><SectionHeading eyebrow="Care, close to home" title="Hospitals & emergency care" action={<Tag>Live availability</Tag>} /><div className="grid gap-3 lg:grid-cols-3">{hospitals.map((hospital) => <div key={hospital.name} className="rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 card-shadow"><div className="mb-5 flex items-start justify-between"><div className="rounded-xl bg-[hsl(var(--primary)/.12)] p-2.5 text-[hsl(var(--primary))]"><Hospital size={21} /></div><span className="mono text-[11px] text-[hsl(var(--muted-foreground))]">{hospital.distance}</span></div><h3 className="display text-lg font-800">{hospital.name}</h3><div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{hospital.area}</div><div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{hospital.phone}</div><div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4"><div><div className="text-xs text-[hsl(var(--muted-foreground))]">Capacity now</div><div className="mt-1 text-sm font-bold text-[hsl(var(--primary))]">{hospital.beds}</div></div><a href={`tel:${hospital.phone.replaceAll(' ', '').replaceAll('-', '')}`} className="rounded-xl border border-[hsl(var(--border))] p-2.5 hover:bg-[hsl(var(--muted))]" aria-label={`Call ${hospital.name}`}><Phone size={16} /></a></div></div>)}</div></section>}
      {(filter === 'All' || filter === 'Medicine') && <section className="mt-11 animate-rise"><SectionHeading eyebrow="Medicine, when you need it" title="Blood & pharmacy" /><div className="grid gap-3 md:grid-cols-2"><div className="rounded-[22px] bg-[hsl(var(--sidebar))] p-5 text-[hsl(var(--sidebar-foreground))]"><div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-[hsl(var(--sidebar-primary)/.18)] p-2.5 text-[hsl(var(--sidebar-primary))]"><Droplets size={20} /></div><div><h3 className="font-bold">Jeevan Jyoti Blood Bank</h3><div className="text-xs opacity-60">Dharampeth · Open now</div></div></div><MapPin size={16} className="opacity-60" /></div><div className="grid grid-cols-3 gap-2">{['O+', 'B+', 'A-'].map((blood, index) => <div key={blood} className="rounded-xl bg-white/5 p-3 text-center"><div className="mono text-lg font-bold text-[hsl(var(--sidebar-primary))]">{blood}</div><div className="mt-1 text-[10px] opacity-60">{[18, 12, 4][index]} units</div></div>)}</div></div><button onClick={() => setPharmacy(true)} data-testid="button-pharmacy-details" className="rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-left transition hover:-translate-y-1 card-shadow"><div className="mb-7 flex items-start justify-between"><div className="rounded-xl bg-[hsl(var(--secondary)/.35)] p-2.5 text-[hsl(var(--foreground))]"><Pill size={20} /></div><Tag>Open now</Tag></div><h3 className="display text-xl font-800">Apollo 24/7 Pharmacy</h3><div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Sitabuldi Metro Station · Open now</div><div className="mt-5 flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]">View pharmacy details <ChevronRight size={15} /></div></button></div></section>}
      {(filter === 'All' || filter === 'Transit') && <section className="mt-11 animate-rise"><SectionHeading eyebrow="Move with the city" title="Transit right now" action={<Tag tone="teal">All lines on time</Tag>} /><div className="grid gap-3 lg:grid-cols-3">{transit.map(({ name, route, timing, color, icon: Icon }) => <div key={name} className="rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 card-shadow"><div className="mb-7 flex items-center justify-between"><div className={`rounded-xl ${color} p-2.5 text-[hsl(var(--foreground))]`}><Icon size={20} /></div><span className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))]"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" /> On time</span></div><h3 className="display text-lg font-800">{name}</h3><div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{route}</div><div className="mt-5 flex items-center gap-2 border-t border-[hsl(var(--border))] pt-4 text-xs"><Clock3 size={14} className="text-[hsl(var(--primary))]" /> {timing}</div></div>)}</div></section>}
      {pharmacy && <Modal title="Apollo 24/7 Pharmacy" onClose={() => setPharmacy(false)}><div className="rounded-2xl bg-[hsl(var(--muted)/.55)] p-4"><div className="flex items-center justify-between"><span className="font-bold">Sitabuldi Metro Station, Nagpur</span><Tag>Open now</Tag></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><div className="text-xs text-[hsl(var(--muted-foreground))]">Availability</div><strong>24/7 pharmacy</strong></div><div><div className="text-xs text-[hsl(var(--muted-foreground))]">Phone</div><strong>1800 103 3300</strong></div></div></div><Button className="mt-4 w-full" onClick={() => setPharmacy(false)}>Close details</Button></Modal>}
    </div>
  );
}

function ServicesWithMaps() {
  const [filter, setFilter] = useState('All');
  const hospitals = [
    { name: 'GMCH Nagpur', area: 'Medical Square', beds: '8 ICU beds available', phone: '+91-712-2725423', distance: '2.1 km' },
    { name: 'AIIMS Nagpur', area: 'MIHAN', beds: '14 ICU beds available', phone: '+91-712-2811000', distance: '7.4 km' },
    { name: 'Orange City Hospital', area: 'Khamla', beds: '3 ICU beds available', phone: '+91-712-6639800', distance: '3.5 km' },
  ];
  const policeStations = [
    { name: 'Sitabuldi Police Station', area: 'Mahatma Gandhi Road, Sitabuldi', phone: '0712-2561222' },
    { name: 'Dharampeth Police Station', area: 'North Ambazari Road, Dharampeth', phone: '0712-2560044' },
    { name: 'Sadar Police Station', area: 'Kasturchand Park, Sadar', phone: '0712-2563333' },
  ];
  const transit = [
    { name: 'Orange Line', route: 'Khapri ↔ Automotive Square', timing: 'Every 6 mins · Next at Sitabuldi in 3 mins', color: 'bg-[hsl(var(--accent))]', icon: RouteIcon },
    { name: 'Aqua Line', route: 'Lokmanya Nagar ↔ Prajapati Nagar', timing: 'Every 6 mins · Next at Sitabuldi in 5 mins', color: 'bg-[hsl(var(--primary))]', icon: Waves },
    { name: 'Feeder EV · E-4', route: 'Sitabuldi to Civil Lines', timing: 'Departing platform 2 in 4 mins', color: 'bg-[hsl(var(--secondary))]', icon: BusFront },
  ];
  const show = (section: 'Healthcare' | 'Safety' | 'Medicine' | 'Transit') =>
    filter === 'All' || filter === section;
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-7 md:px-10 md:py-12">
      <div className="animate-rise mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <Tag>Verified city services</Tag>
          <h1 className="display mt-4 text-4xl font-800 tracking-[-.04em] sm:text-6xl">
            Find your<br /><span className="text-[hsl(var(--primary))]">next stop.</span>
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          Healthcare, medicine, safety and mobility—with one-tap directions for Nagpur.
        </p>
      </div>
      <div className="mb-10 flex gap-2 mobile-scroll">
        {['All', 'Healthcare', 'Safety', 'Medicine', 'Transit'].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            data-testid={`button-filter-${item.toLowerCase()}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${filter === item ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]' : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]'}`}
          >
            {item}
          </button>
        ))}
      </div>
      {show('Healthcare') && (
        <section className="animate-rise">
          <SectionHeading eyebrow="Care, close to home" title="Hospitals & emergency care" action={<Tag>Live availability</Tag>} />
          <div className="grid gap-3 lg:grid-cols-3">
            {hospitals.map((hospital) => (
              <div key={hospital.name} className="rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 card-shadow">
                <div className="mb-5 flex items-start justify-between">
                  <div className="rounded-xl bg-[hsl(var(--primary)/.12)] p-2.5 text-[hsl(var(--primary))]"><Hospital size={21} /></div>
                  <span className="mono text-[11px] text-[hsl(var(--muted-foreground))]">{hospital.distance}</span>
                </div>
                <h3 className="display text-lg font-800">{hospital.name}</h3>
                <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{hospital.area}</div>
                <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{hospital.phone}</div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[hsl(var(--border))] pt-4">
                  <div><div className="text-xs text-[hsl(var(--muted-foreground))]">Capacity now</div><div className="mt-1 text-sm font-bold text-[hsl(var(--primary))]">{hospital.beds}</div></div>
                  <div className="flex gap-2">
                    <a href={`tel:${hospital.phone.replaceAll(' ', '').replaceAll('-', '')}`} className="rounded-xl border border-[hsl(var(--border))] p-2.5 hover:bg-[hsl(var(--muted))]" aria-label={`Call ${hospital.name}`}><Phone size={16} /></a>
                    <MapsButton query={hospital.name} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {show('Safety') && (
        <section className="mt-11 animate-rise">
          <SectionHeading eyebrow="Verified nearby locations" title="Police stations" action={<Tag tone="coral">Directions ready</Tag>} />
          <div className="grid gap-3 lg:grid-cols-3">
            {policeStations.map((station) => (
              <div key={station.name} className="rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 card-shadow">
                <div className="mb-5 flex items-start justify-between">
                  <div className="rounded-xl bg-[hsl(var(--accent)/.12)] p-2.5 text-[hsl(var(--accent))]"><Shield size={21} /></div>
                  <Tag tone="teal">Open 24/7</Tag>
                </div>
                <h3 className="display text-lg font-800">{station.name}</h3>
                <div className="mt-2 flex items-start gap-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]"><MapPin size={14} className="mt-0.5 shrink-0" /> {station.area}</div>
                <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{station.phone}</div>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-[hsl(var(--border))] pt-4">
                  <a href={`tel:${station.phone.replaceAll('-', '')}`} className="inline-flex items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-xs font-bold hover:bg-[hsl(var(--muted))]"><Phone size={14} /> Call station</a>
                  <MapsButton query={station.name} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {show('Medicine') && (
        <section className="mt-11 animate-rise">
          <SectionHeading eyebrow="Medicine, when you need it" title="Blood & pharmacy" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[22px] bg-[hsl(var(--sidebar))] p-5 text-[hsl(var(--sidebar-foreground))]">
              <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-[hsl(var(--sidebar-primary)/.18)] p-2.5 text-[hsl(var(--sidebar-primary))]"><Droplets size={20} /></div><div><h3 className="font-bold">Jeevan Jyoti Blood Bank</h3><div className="text-xs opacity-60">Dharampeth · Open now</div></div></div>
              <div className="grid grid-cols-3 gap-2">{['O+', 'B+', 'A-'].map((blood, index) => <div key={blood} className="rounded-xl bg-white/5 p-3 text-center"><div className="mono text-lg font-bold text-[hsl(var(--sidebar-primary))]">{blood}</div><div className="mt-1 text-[10px] opacity-60">{[18, 12, 4][index]} units</div></div>)}</div>
              <div className="mt-4"><MapsButton query="Jeevan Jyoti Blood Bank Dharampeth" /></div>
            </div>
            <div className="rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 card-shadow">
              <div className="mb-5 flex items-start justify-between"><div className="rounded-xl bg-[hsl(var(--secondary)/.35)] p-2.5"><Pill size={20} /></div><Tag>Open now</Tag></div>
              <h3 className="display text-xl font-800">Apollo 24/7 Pharmacy</h3>
              <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Sitabuldi Metro Station · Open now</div>
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[hsl(var(--border))] pt-4"><span className="text-xs text-[hsl(var(--muted-foreground))]">1800 103 3300</span><MapsButton query="Apollo 24/7 Pharmacy Sitabuldi Metro Station" /></div>
            </div>
          </div>
        </section>
      )}
      {show('Transit') && (
        <section className="mt-11 animate-rise">
          <SectionHeading eyebrow="Move with the city" title="Transit right now" action={<Tag tone="teal">All lines on time</Tag>} />
          <div className="grid gap-3 lg:grid-cols-3">{transit.map(({ name, route, timing, color, icon: Icon }) => <div key={name} className="rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 card-shadow"><div className="mb-7 flex items-center justify-between"><div className={`rounded-xl ${color} p-2.5`}><Icon size={20} /></div><span className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))]"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" /> On time</span></div><h3 className="display text-lg font-800">{name}</h3><div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{route}</div><div className="mt-5 flex items-center gap-2 border-t border-[hsl(var(--border))] pt-4 text-xs"><Clock3 size={14} className="text-[hsl(var(--primary))]" /> {timing}</div></div>)}</div>
        </section>
      )}
    </div>
  );
}

function Grievances({
  tickets,
  onSubmit,
}: {
  tickets: Ticket[];
  onSubmit: (
    category: string,
    location: string,
    description: string,
    department: string,
    attachments: string[],
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const visible = useMemo(() => tickets.filter((ticket) => `${ticket.id} ${ticket.category} ${ticket.location}`.toLowerCase().includes(query.toLowerCase())), [tickets, query]);
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-7 md:px-10 md:py-12">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-6 animate-rise"><div><Tag tone="amber">NMC service desk</Tag><h1 className="display mt-4 text-4xl font-800 tracking-[-.04em] sm:text-6xl">Small reports.<br /><span className="text-[hsl(var(--primary))]">Real progress.</span></h1><p className="mt-4 max-w-lg text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">Report a sanitation issue and follow it from neighbourhood to resolution.</p></div><Button onClick={() => setOpen(true)} testId="button-new-grievance"><Plus size={17} /> New report</Button></div>
      <div className="mb-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"><div className="text-xs text-[hsl(var(--muted-foreground))]">Your reports</div><div className="display mt-2 text-3xl font-800">{tickets.length}</div></div><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"><div className="text-xs text-[hsl(var(--muted-foreground))]">In progress</div><div className="display mt-2 text-3xl font-800 text-[hsl(var(--secondary-foreground))]">{tickets.filter((ticket) => ticket.status.includes('Dispatched') || ticket.status.includes('Review') || ticket.status === 'Received').length}</div></div><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"><div className="text-xs text-[hsl(var(--muted-foreground))]">Resolved</div><div className="display mt-2 text-3xl font-800 text-[hsl(var(--primary))]">{tickets.filter((ticket) => ticket.status.includes('Resolved')).length}</div></div></div>
      <div className="mb-5 flex items-center justify-between gap-3"><SectionHeading eyebrow="Your civic trail" title="Report tracker" /><div className="relative hidden sm:block"><FileText size={15} className="absolute left-3 top-3 text-[hsl(var(--muted-foreground))]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a ticket" data-testid="input-search-tickets" className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div></div>
      <div className="space-y-3">{visible.map((ticket, index) => <div key={ticket.id} className={`animate-rise delay-${Math.min(index + 1, 4)} rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 card-shadow`}><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><div className="rounded-xl bg-[hsl(var(--muted))] p-2.5 text-[hsl(var(--primary))]"><Trash2 size={18} /></div><div><div className="mono text-[11px] text-[hsl(var(--muted-foreground))]">{ticket.id}</div><h3 className="mt-1 text-base font-bold">{ticket.category}</h3><div className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]"><MapPin size={12} /> {ticket.location}</div></div></div><Tag tone={ticket.tone}>{ticket.status}</Tag></div><div className="mt-5 flex items-center gap-2 border-t border-[hsl(var(--border))] pt-4 text-xs font-semibold text-[hsl(var(--muted-foreground))]"><Clock3 size={14} className="text-[hsl(var(--primary))]" /> {ticket.detail}</div></div>)}{visible.length === 0 && <div className="rounded-[22px] border border-dashed border-[hsl(var(--border))] p-12 text-center"><Trash2 className="mx-auto mb-3 text-[hsl(var(--muted-foreground))]" /><p className="font-bold">No reports found</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Try another ticket number or location.</p></div>}</div>
      {open && <GrievanceModal onClose={() => setOpen(false)} onSubmit={onSubmit} />}
    </div>
  );
}

function Ideas() {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [voted, setVoted] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newIdea, setNewIdea] = useState('');
  const vote = (id: number) => {
    if (voted.includes(id)) return;
    setVoted([...voted, id]);
    setIdeas(ideas.map((idea) => idea.id === id ? { ...idea, votes: idea.votes + 1 } : idea));
  };
  const add = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newIdea.trim()) return;
    setIdeas([{ id: Date.now(), title: newIdea, body: 'Shared by a resident of Nagpur. Community description awaiting your additions.', author: 'You', votes: 1, status: 'New idea', color: 'coral' }, ...ideas]);
    setNewIdea('');
    setShowForm(false);
  };
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-7 md:px-10 md:py-12">
      <div className="mb-10 grid gap-7 lg:grid-cols-[1fr_340px] lg:items-end"><div className="animate-rise"><Tag tone="coral">Viksit Nagpur 2047</Tag><h1 className="display mt-4 text-4xl font-800 tracking-[-.05em] sm:text-6xl">The future is<br /><span className="text-[hsl(var(--accent))]">a group project.</span></h1><p className="mt-4 max-w-lg text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">Big ambition, grounded in everyday life. Share an idea, find your people, and help shape Nagpur’s next chapter.</p></div><div className="animate-rise delay-2 rounded-[22px] bg-[hsl(var(--secondary)/.28)] p-5"><div className="flex items-center justify-between"><div className="display text-3xl font-800">{ideas.reduce((total, idea) => total + idea.votes, 0)}</div><Vote className="text-[hsl(var(--accent))]" /></div><div className="mt-1 text-sm font-bold">community votes so far</div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--secondary)/.4)]"><div className="h-full w-[72%] rounded-full bg-[hsl(var(--accent))]" /></div><div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">2047 begins with one good question.</div></div></div>
      <div className="mb-6 flex items-center justify-between"><SectionHeading eyebrow="From the neighbourhood" title="Ideas worth carrying forward" /><Button variant="outline" onClick={() => setShowForm(true)} testId="button-share-idea"><Plus size={17} /> Share an idea</Button></div>
      <div className="grid gap-4 lg:grid-cols-3">{ideas.map((idea, index) => <article key={idea.id} className={`animate-rise delay-${Math.min(index + 1, 4)} flex flex-col rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 card-shadow transition hover:-translate-y-1`}><div className="mb-8 flex items-center justify-between"><Tag tone={idea.color === 'teal' ? 'teal' : idea.color === 'saffron' ? 'amber' : 'coral'}>{idea.status}</Tag><button onClick={() => vote(idea.id)} disabled={voted.includes(idea.id)} data-testid={`button-vote-idea-${idea.id}`} className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${voted.includes(idea.id) ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'}`}><Vote size={14} /> {idea.votes}</button></div><h2 className="display text-xl font-800 leading-tight">{idea.title}</h2><p className="mt-3 flex-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{idea.body}</p><div className="mt-7 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4 text-xs"><span className="font-bold">{idea.author}</span><span className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]"><Star size={13} /> Resident idea</span></div></article>)}</div>
      {showForm && <Modal title="Share your 2047 idea" onClose={() => setShowForm(false)}><form onSubmit={add} className="space-y-4"><label className="block text-sm font-bold">Your big question or idea<textarea value={newIdea} onChange={(event) => setNewIdea(event.target.value)} data-testid="textarea-new-idea" placeholder="What would make everyday life better in Nagpur?" rows={4} className="mt-2 w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></label><Button type="submit" className="w-full" disabled={!newIdea.trim()} testId="button-submit-idea"><Lightbulb size={17} /> Add to the board</Button></form></Modal>}
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const page = location === '/' ? '/' : location;
  const [profile, setProfile] = useState<Profile>(() => getStoredProfile());
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [stats, setStats] = useState<Stats>({
    complaintsResolved: 27,
    garbageVehiclesActive: 14,
    potholesRepaired: 8,
    waterLeaksFixed: 3,
    civicProjectsCompleted: 2,
  });
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const addNotification: Notify = (title, detail, tone = 'teal') =>
    setNotifications((current) => [
      {
        id: `notification-${Date.now()}-${current.length}`,
        title,
        detail,
        time: 'Just now',
        read: false,
        tone,
      },
      ...current,
    ].slice(0, 8));
  const saveProfile = (nextProfile: Profile) => {
    setProfile(nextProfile);
    window.localStorage.setItem('nagpursetu-profile', JSON.stringify(nextProfile));
    addNotification('Safety profile saved', 'Your details are now connected to SOS, Medical ID, and quick contacts.');
  };
  const submit = (
    category: string,
    locationValue: string,
    description: string,
    department: string,
    attachments: string[],
  ) => {
    const id = `NMC-SAN-${String(1043 + tickets.length).padStart(4, '0')}`;
    setTickets((current) => [
      {
        id,
        category,
        location: locationValue,
        status: 'Received by department',
        detail: `${department} · ${attachments.length ? `${attachments.length} media file${attachments.length > 1 ? 's' : ''} attached` : 'No media attached'}`,
        tone: 'coral',
        department,
        description,
        attachments,
      },
      ...current,
    ]);
    setStats((current) => ({ ...current, complaintsResolved: current.complaintsResolved + 1 }));
    addNotification(
      'New grievance registered',
      `${id} was sent to ${department}${attachments.length ? ` with ${attachments.length} photo/video attachment${attachments.length > 1 ? 's' : ''}` : ''}.`,
      'amber',
    );
  };
  return (
    <RoutedErrorBoundary>
      <Shell
        page={page}
        profile={profile}
        notifications={notifications}
        onMarkAllRead={() => setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))}
      >
        <Switch>
          <Route path="/" component={() => <Home stats={stats} tickets={tickets} profile={profile} onSubmit={submit} onNotify={addNotification} />} />
          <Route path="/login" component={() => <ProfilePage profile={profile} onSave={saveProfile} />} />
          <Route path="/emergency" component={() => <Emergency profile={profile} onNotify={addNotification} />} />
          <Route path="/services" component={ServicesWithMaps} />
          <Route path="/grievances" component={() => <Grievances tickets={tickets} onSubmit={submit} />} />
          <Route path="/ideas" component={Ideas} />
          <Route component={NotFound} />
        </Switch>
      </Shell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;