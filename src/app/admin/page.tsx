'use client';

import { LayoutDashboard } from "lucide-react";
import { AdminLayout } from "@/modules/admin/layout/AdminLayout";
import { DashboardSection } from "@/modules/admin/sections/DashboardSection";

export default function AdminPage() {
    return (
        <AdminLayout title="Admin Dashboard" icon={<LayoutDashboard className="h-6 w-6" />}>
            <DashboardSection />
        </AdminLayout>
    );
}
