import type { IconKey } from "@/lib/services";
import { CameraIcon, PaletteIcon, PrinterIcon } from "./icons";

const map = {
  camera: CameraIcon,
  printer: PrinterIcon,
  palette: PaletteIcon,
} as const;

export default function ServiceIcon({
  icon,
  className,
}: {
  icon: IconKey;
  className?: string;
}) {
  const Icon = map[icon];
  return <Icon className={className} />;
}
