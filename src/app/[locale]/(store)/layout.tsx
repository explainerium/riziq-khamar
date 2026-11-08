import { AnnouncementBar } from "@/components/store/layout/AnnouncementBar";
import { ContactFab } from "@/components/store/layout/ContactFab";
import { SiteFooter } from "@/components/store/layout/SiteFooter";
import { SiteHeader } from "@/components/store/layout/SiteHeader";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
      <ContactFab />
    </>
  );
}
