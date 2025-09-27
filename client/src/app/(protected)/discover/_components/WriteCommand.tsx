"use client"
import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const WriteCommentModal = () => {
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState("")

  const handleSubmit = () => {
    console.log("User comment:", comment)
    // You can hook this into your backend API
    setComment("")
    setOpen(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Write your words</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Write your Comment</DialogTitle>
          </DialogHeader>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default WriteCommentModal
