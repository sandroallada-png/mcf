'use client';

import { Utensils } from "lucide-react";
import { AdminLayout } from "@/modules/admin/layout/AdminLayout";
import { DishesSection } from "@/modules/admin/sections/DishesSection";

export default function AdminDishesPage() {
    return (
        <AdminLayout title="Gestion des Repas" icon={<Utensils className="h-6 w-6" />}>
            <DishesSection />
        </AdminLayout>
    );
}
