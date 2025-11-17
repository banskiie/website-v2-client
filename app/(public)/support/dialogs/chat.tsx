"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Headphones, ArrowLeft, ArrowDown, Paperclip, ImageIcon, File, Send, MessageCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import Image from "next/image"

interface ChatInterfaceProps {
  name: string
  email: string
  ticketId: string | null
  messages: any[]
  inputMessage: string
  setInputMessage: (message: string) => void
  handleSendMessage: (e: React.FormEvent) => void
  handleBack: () => void
  handleClearChat: () => void
  handleDownloadChat: () => void
  hasNewMessages: boolean
  isUserAtBottom: boolean
  scrollToBottom: (behavior?: ScrollBehavior) => void
  showLoadMoreText: boolean
  hasMore: boolean
  isLoadingMore: boolean
  isReplying: boolean
  renderMessagesWithTimestamps: (messages: any[]) => React.JSX.Element | null
  chatContainerRef: React.RefObject<HTMLDivElement>
  isAttachmentMenuOpen: boolean
  setIsAttachmentMenuOpen: (open: boolean) => void
  attachmentPreview: string | null
  attachmentFile: File | null
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveAttachment: () => void
  isLoading?: boolean
}

export function ChatInterface({
  name,
  email,
  ticketId,
  messages,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleBack,
  handleClearChat,
  handleDownloadChat,
  hasNewMessages,
  isUserAtBottom,
  scrollToBottom,
  showLoadMoreText,
  hasMore,
  isLoadingMore,
  isReplying,
  renderMessagesWithTimestamps,
  chatContainerRef,
  isAttachmentMenuOpen,
  setIsAttachmentMenuOpen,
  attachmentPreview,
  attachmentFile,
  handleFileSelect,
  handleRemoveAttachment,
  isLoading = false,
}: ChatInterfaceProps) {
  return (
    <motion.div
      className="w-full h-screen flex pt-16"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {/* Sidebar */}
      <div className="w-64 bg-linear-to-b from-green-50 to-emerald-50 border-r border-green-100 shrink-0 p-6 space-y-6">
        <div>
          <h3 className="text-green-900 font-semibold mb-2">C-ONE Chat Support</h3>
          <p className="text-xs text-green-700">Your support conversation</p>
        </div>

        <div className="h-px bg-green-200"></div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-green-600">Email</p>
            <p className="text-sm text-green-900 font-medium">{email}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-green-600">Name</p>
            <p className="text-sm text-green-900 font-medium">{name}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-green-600">Last Activity</p>
            <p className="text-sm text-green-900">
              {messages.length > 0
                ? `${new Date(messages[messages.length - 1].timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Just now'
              }
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-green-600">Status</p>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
              Active
            </div>
          </div>
        </div>

        <div className="h-px bg-green-200"></div>

        <div className="space-y-3">
          <p className="text-xs text-green-600">Quick Actions</p>
          <Button
            onClick={handleClearChat}
            className="w-full justify-start bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            New Chat
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-green-700 border-green-300 hover:bg-green-100 text-sm"
            onClick={handleDownloadChat}
          >
            <File className="w-4 h-4 mr-2" />
            Download Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white shadow-lg overflow-hidden">
        <div className="bg-white p-3 text-black shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-r from-green-600 to-green-500 text-white p-3 rounded-full backdrop-blur-sm">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base text-gray-900 font-semibold">Live Support</h2>
                <p className="text-sm text-black/80">{name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white p-2 rounded-md cursor-pointer backdrop-blur-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 relative">
          <AnimatePresence>
            {hasNewMessages && !isUserAtBottom && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => scrollToBottom('smooth')}
                className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                New Messages
                <ArrowDown className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!isUserAtBottom && (
              <motion.button
                animate={{
                  y: [0, -25, 0],
                  transition: {
                    duration: 1.8,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  },
                }}
                onClick={() => scrollToBottom('smooth')}
                className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 bg-green-600 hover:bg-green-500 text-white p-3 rounded-full shadow-lg transition-all duration-200 cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowDown className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300"
          >

            {!hasMore && messages.length > 10 && (
              <div className="flex justify-center py-2">
                <div className="text-gray-400 text-sm">
                  Beginning of conversation
                </div>
              </div>
            )}

            {messages.length === 0 && ticketId ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-full text-center py-12"
              >
                <div className="bg-green-100 p-6 rounded-2xl max-w-md mx-auto">
                  <div className="bg-green-600 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Loading Conversation...
                  </h3>
                  <p className="text-green-700 text-sm">
                    Please wait while we load your messages.
                  </p>
                </div>
              </motion.div>
            ) : (
              <>
                {renderMessagesWithTimestamps(messages)}

                {isReplying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-none max-w-xs sm:max-w-sm text-sm flex gap-1 items-center">
                      <motion.span
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.span
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
                      />
                      <motion.span
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
                      />
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t p-4 bg-white relative">
            <AnimatePresence>
              {isAttachmentMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 z-10"
                >
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors">
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-input"
                      />
                    </label>

                    <label className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors">
                      <File className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">File</span>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-input"
                      />
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {attachmentPreview && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white border rounded-lg mx-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={attachmentPreview}
                    alt="Attachment preview"
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">
                      {attachmentFile?.name || 'Image'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(attachmentFile?.size || 0) / 1024} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="text-gray-500 hover:text-red-500 hover:bg-gray-200! bg-transparent transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
              className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <InputGroup className="flex-1">
              <InputGroupTextarea
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e as unknown as React.FormEvent)
                  }
                }}
                className="px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-10! max-h-32 overflow-y-auto resize-none"
                rows={1}
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              />
            </InputGroup>

            <Button
              type="submit"
              disabled={!inputMessage.trim() && !attachmentFile}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-5 rounded-md"
            >
              <Send className="w-4 h-4" />
              Send
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  )
}