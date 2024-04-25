import Image from "next/image";
import heavyImage from "../../public/heavy-image.jpeg";

export default async function Extras() {
    return (
        <div className="flex flex-col gap-3 py-10">
            <Image src={heavyImage} alt="" placeholder="blur" />
        </div>
    );
}
