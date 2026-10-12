/**
 * Icon proxy. Every icon import goes through `@icons`, never `lucide-react`
 * directly, so the library can be swapped in exactly one place.
 *
 * Kept deliberately narrow: an icon is added here when a screen needs it.
 */
export {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Crown,
  Diamond,
  Eye,
  EyeOff,
  Flame,
  Home,
  Infinity as InfinityIcon,
  Loader2,
  Maximize,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  Shuffle,
  SkipForward,
  Smartphone,
  Sparkles,
  Square,
  Target,
  Triangle,
  Trophy,
  Tv,
  Users,
  Volume2,
  VolumeX,
  WifiOff,
  X,
  Zap,
} from 'lucide-react';

export type { LucideIcon, LucideProps } from 'lucide-react';
