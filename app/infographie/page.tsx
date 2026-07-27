import type { Metadata } from "next";
import ServicePage from "@/app/components/ServicePage";
import { getService } from "@/lib/services";

const service = getService("infographie")!;

export const metadata: Metadata = {
  title: "Infographie & design",
  description: service.short,
};

export default function Page() {
  return <ServicePage service={service} />;
}
