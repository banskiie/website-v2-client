import Header from '@/components/custom/header-white'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function page() {
    return (
        <div className="min-screen flex flex-col">
            <Header />

            <div className="w-full min-h-screen p-12 bg-[#f5f2ec">
                <div className="flex items-center text-gray-600 text-sm mb-6 mt-7">
                    <Link
                        href="/rentals/#featured-products"
                        className="hover:text-[#2FB44D] font-medium transition-colors"
                    >
                        Rentals
                    </Link>
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                    <span className="font-medium text-gray-600">Other Categories</span>
                </div>

            </div>

        </div>
    )
}

export default page