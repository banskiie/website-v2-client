"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CLOUD } from "./main-faq"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col items-start">
          <Image
            src={`${CLOUD}/v1764038540/c-one-logo2_y4elbf.png`}
            alt="C-One Logo"
            width={100}
            height={100}
          />
          <span className="mt-2 text-xs text-gray-600">
            &copy; {currentYear} C-ONE. All Rights Reserved.
          </span>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-2">Legal</h3>
          <ul className="space-y-1">
            <li>
              <a href="#" className="text-gray-600 text-xs hover:underline">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 text-xs hover:underline">
                Terms Of Service
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-2">Resources</h3>
          <ul className="space-y-1">
            <li>
              <a href="#" className="text-gray-600 text-xs hover:underline">
                Help Center
              </a>
            </li>
            <li>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-gray-600 text-xs hover:underline">
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
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                      >
                        Send Email
                      </button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </li>
            <li>
              <a href="#" className="text-gray-600 text-xs hover:underline">
                About
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 text-xs hover:underline">
                Affiliate
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-2">Social Media</h3>
          <ul className="space-y-1 mb-4">
            <li>
              <a
                href="https://www.facebook.com/conetrucksandequipment"
                target="_blank"
                rel="noopener"
                className="text-gray-600 text-xs hover:underline"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
