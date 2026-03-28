'use client';

import { Users } from "lucide-react";
import { AdminLayout } from "@/modules/admin/layout/AdminLayout";
import { UsersSection } from "@/modules/admin/sections/UsersSection";

export default function AdminUsersPage() {
    return (
        <AdminLayout title="Gestion des Utilisateurs" icon={<Users className="h-6 w-6" />}>
            <UsersSection />
        </AdminLayout>
    );
}
