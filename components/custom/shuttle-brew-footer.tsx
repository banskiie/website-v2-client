"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CLOUD } from "./main-faq"

export default function ShuttleBrewFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#7a3e18] text-[#f5f5f5] ">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col items-start">
          <Image
            src={`${CLOUD}/v1764048136/sb_icon_ftg2zo.png`}
            alt="ShuttleBrew Logo"
            width={100}
            height={100}
          />
          <span className="mt-2 text-xs text-[#f0e6d6]">
            &copy; {currentYear} ShuttleBrew. All Rights Reserved.
          </span>
        </div>

        <div>
          <h3 className="font-medium text-[#FFBC52] mb-2">Legal</h3>
          <ul className="space-y-1">
            <li>
              <a href="#" className="text-[#f0e6d6] text-xs hover:text-[#d9a453] transition">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="text-[#f0e6d6] text-xs hover:text-[#d9a453] transition">
                Terms Of Service
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-[#FFBC52] mb-2">Resources</h3>
          <ul className="space-y-1">
            <li>
              <a href="#" className="text-[#f0e6d6] text-xs hover:text-[#d9a453] transition">
                Help Center
              </a>
            </li>
            <li>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-[#f0e6d6] text-xs hover:text-[#d9a453] transition">
                    Contact
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Contact Us</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-xs font-medium text-gray-700">
                        Message
                      </label>
                      <textarea
                        id="message"
                        className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                        rows={4}
                        required
                      ></textarea>
                    </div>
                    <DialogFooter>
                      <button
                        type="submit"
                        className="w-full bg-[#FFBC52] text-[#5a2c0f] py-2 rounded hover:bg-[#d9a453] transition"
                      >
                        Send Email
                      </button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </li>
            <li>
              <a href="#" className="text-[#f0e6d6] text-xs hover:text-[#d9a453] transition">
                About
              </a>
            </li>
            <li>
              <a href="#" className="text-[#f0e6d6] text-xs hover:text-[#d9a453] transition">
                Affiliate
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-[#FFBC52] mb-2">Social Media</h3>
          <ul className="space-y-1 mb-4">
            <li>
              <a
                href="https://www.facebook.com/ShuttleBrewCoffeeShop"
                target="_blank"
                rel="noopener"
                className="text-[#f0e6d6] text-xs hover:text-[#d9a453] transition"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-[#f0e6d6] text-xs hover:text-[#d9a453] transition"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
