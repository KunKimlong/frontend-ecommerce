import {Metadata} from "next";
import BannerForm from "@/app/(admin)/(others-pages)/banner/BannerForm";

export const metadata: Metadata = {
    title: "Create Banner",
};

export default function BannerCreatePage() {
    return <BannerForm/>;
}
