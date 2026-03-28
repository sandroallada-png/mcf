'use client';

import { Library } from "lucide-react";
import { AdminLayout } from "@/modules/admin/layout/AdminLayout";
import { AtelierSection } from "@/modules/admin/sections/AtelierSection";

export default function AdminAtelierPage() {
    return (
        <AdminLayout title="Gestion de l'Atelier" icon={<Library className="h-6 w-6" />}>
            <AtelierSection />
        </AdminLayout>
    );
}
