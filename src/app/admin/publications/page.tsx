'use client';

import { FileText } from "lucide-react";
import { AdminLayout } from "@/modules/admin/layout/AdminLayout";
import { PublicationsSection } from "@/modules/admin/sections/PublicationsSection";

export default function AdminPublicationsPage() {
    return (
        <AdminLayout title="Gestion des Publications" icon={<FileText className="h-6 w-6" />}>
            <PublicationsSection />
        </AdminLayout>
    );
}
