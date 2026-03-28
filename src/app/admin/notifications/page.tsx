'use client';

import { Bell } from "lucide-react";
import { AdminLayout } from "@/modules/admin/layout/AdminLayout";
import { NotificationsSection } from "@/modules/admin/sections/NotificationsSection";

export default function AdminNotificationsPage() {
    return (
        <AdminLayout title="Gestion des Notifications" icon={<Bell className="h-6 w-6" />}>
            <NotificationsSection />
        </AdminLayout>
    );
}
