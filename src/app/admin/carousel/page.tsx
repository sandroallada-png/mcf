'use client';

import { GalleryHorizontal } from "lucide-react";
import { AdminLayout } from "@/modules/admin/layout/AdminLayout";
import { CarouselSection } from "@/modules/admin/sections/CarouselSection";

export default function AdminCarouselPage() {
    return (
        <AdminLayout title="Gestion du Carrousel" icon={<GalleryHorizontal className="h-6 w-6" />}>
            <CarouselSection />
        </AdminLayout>
    );
}
