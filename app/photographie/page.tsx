import type { Metadata } from "next";
import ServicePage from "@/app/components/ServicePage";
import { getService } from "@/lib/services";

const service = getService("photographie")!;

export const metadata: Metadata = {
  title: "Photographie professionnelle",
  description: service.short,
};

export default function Page() {
  return <ServicePage service={service} />;
}
