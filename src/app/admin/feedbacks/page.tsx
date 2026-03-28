'use client';

import { Star } from "lucide-react";
import { AdminLayout } from "@/modules/admin/layout/AdminLayout";
import { FeedbacksSection } from "@/modules/admin/sections/FeedbacksSection";

export default function AdminFeedbacksPage() {
    return (
        <AdminLayout title="Gestion des Feedbacks" icon={<Star className="h-6 w-6" />}>
            <FeedbacksSection />
        </AdminLayout>
    );
}
