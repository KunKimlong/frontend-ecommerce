"use client";
import {useParams} from "next/navigation";
import VariantEditForm from "../../../../VariantEditForm";

export default function EditVariantPage() {
    const {id, variantId} = useParams<{ id: string; variantId: string }>();

    return <VariantEditForm productId={Number(id)} variantId={Number(variantId)}/>;
}
