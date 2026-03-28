'use client';

import { MessageSquare } from "lucide-react";
import { AdminLayout } from "@/modules/admin/layout/AdminLayout";
import { MessagesSection } from "@/modules/admin/sections/MessagesSection";

export default function AdminMessagesPage() {
    return (
        <AdminLayout title="Gestion des Messages" icon={<MessageSquare className="h-6 w-6" />}>
            <MessagesSection />
        </AdminLayout>
    );
}
