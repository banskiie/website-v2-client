"use client"
import React, { FC, useState } from "react"
import Image from "next/image"

interface ProductGalleryProps {
    images: string[]
    description: string
}

const ProductGallery: FC<ProductGalleryProps> = ({ images, description }) => {
    const [selectedImage, setSelectedImage] = useState(images[0])

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
                <Image
                    src={selectedImage}
                    alt="Selected Product"
                    width={600}
                    height={400}
                    className="object-cover w-full h-auto rounded-md"
                />
                <p className="mt-4 text-black font-medium text-md tracking-wider">{description}</p>
            </div>

            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`cursor-pointer border-2 rounded-md ${selectedImage === img ? "border-green-500" : "border-transparent"}`}
                    >
                        <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            width={100}
                            height={70}
                            className="object-cover w-[100px] h-[70px] rounded-md"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProductGallery
