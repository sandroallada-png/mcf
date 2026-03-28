'use client';

import { Trash2 } from "lucide-react";
import { AdminLayout } from "@/modules/admin/layout/AdminLayout";
import { DeletedMembersSection } from "@/modules/admin/sections/DeletedMembersSection";

export default function DeletedMembersAdminPage() {
    return (
        <AdminLayout title="Membres Supprimés" icon={<Trash2 className="h-6 w-6" />}>
            <DeletedMembersSection />
        </AdminLayout>
    );
}
