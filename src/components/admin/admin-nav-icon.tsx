import {
  CalendarBlankIcon,
  EnvelopeSimpleIcon,
  HouseIcon,
  ImageIcon,
  NewspaperIcon,
  StarIcon,
  TrayIcon,
  UserCircleIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react/dist/ssr";

import type { AdminNavIconName } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

const icons = {
  home: HouseIcon,
  agenda: CalendarBlankIcon,
  news: NewspaperIcon,
  bio: UserCircleIcon,
  highlights: StarIcon,
  photos: ImageIcon,
  videos: YoutubeLogoIcon,
  contact: EnvelopeSimpleIcon,
  messages: TrayIcon,
} satisfies Record<
  AdminNavIconName,
  React.ComponentType<{ className?: string; weight?: "regular" | "duotone" }>
>;

export function AdminNavIcon({
  name,
  className,
  weight = "regular",
}: {
  name: AdminNavIconName;
  className?: string;
  weight?: "regular" | "duotone";
}) {
  const Icon = icons[name];

  return <Icon className={cn("size-4 shrink-0", className)} weight={weight} />;
}
