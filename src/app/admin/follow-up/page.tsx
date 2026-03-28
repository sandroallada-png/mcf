'use client';

import { Activity } from "lucide-react";
import { AdminLayout } from "@/modules/admin/layout/AdminLayout";
import { FollowUpSection } from "@/modules/admin/sections/FollowUpSection";

export default function AdminFollowUpPage() {
    return (
        <AdminLayout title="Suivi et Relance" icon={<Activity className="h-6 w-6" />}>
            <FollowUpSection />
        </AdminLayout>
    );
}
