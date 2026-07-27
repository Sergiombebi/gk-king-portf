import type { Metadata } from "next";
import ServicePage from "@/app/components/ServicePage";
import { getService } from "@/lib/services";

const service = getService("impression-numerique")!;

export const metadata: Metadata = {
  title: "Impression numérique",
  description: service.short,
};

export default function Page() {
  return <ServicePage service={service} />;
}
