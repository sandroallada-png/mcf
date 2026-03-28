'use client';

import { Ticket } from "lucide-react";
import { AdminLayout } from "@/modules/admin/layout/AdminLayout";
import { PromotionsSection } from "@/modules/admin/sections/PromotionsSection";

export default function AdminPromotionsPage() {
    return (
        <AdminLayout title="Gestion des Promotions" icon={<Ticket className="h-6 w-6" />}>
            <PromotionsSection />
        </AdminLayout>
    );
}
