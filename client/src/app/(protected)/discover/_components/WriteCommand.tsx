"use client"
import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMutationHook } from "@/hooks/useMutationHook"
import { createCommentApi } from "@/apis/commentApi"
import { toast } from "sonner"
import { useEditorStore } from "@/stores/editorStore"

const WriteCommentModal = ({ fetchComments }) => {
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState("")
  const projectId = useEditorStore((state) => state.projectId)

  const { mutate: createComment } = useMutationHook(createCommentApi, {
    onSuccess(data) {
      setOpen(false)
      fetchComments(projectId)
      setComment("")
      toast.success(data.message)
    }
  })

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
            <Button onClick={() => {
              if (comment && projectId) createComment({ comment, projectId })
            }}>Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default WriteCommentModal
