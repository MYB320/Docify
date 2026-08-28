"use client"

import { useState } from "react"
import { Bell, Mail, MessageSquare, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [documentShared, setDocumentShared] = useState(true)
  const [comments, setComments] = useState(true)
  const [mentions, setMentions] = useState(true)
  const [collaboratorJoined, setCollaboratorJoined] = useState(false)

  return (
    <Card id="notifications">
      <CardHeader>
        <CardTitle className="text-foreground">Notification Preferences</CardTitle>
        <CardDescription>Choose how you want to be notified</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Notification Channels</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-sm font-medium text-foreground">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
            </div>
            <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications" className="text-sm font-medium text-foreground">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
              </div>
            </div>
            <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="mb-4 text-sm font-medium text-foreground">Activity Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="document-shared" className="text-sm font-medium text-foreground">
                    Document Shared
                  </Label>
                  <p className="text-sm text-muted-foreground">When someone shares a document with you</p>
                </div>
              </div>
              <Switch id="document-shared" checked={documentShared} onCheckedChange={setDocumentShared} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="comments" className="text-sm font-medium text-foreground">
                    Comments
                  </Label>
                  <p className="text-sm text-muted-foreground">When someone comments on your document</p>
                </div>
              </div>
              <Switch id="comments" checked={comments} onCheckedChange={setComments} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="mentions" className="text-sm font-medium text-foreground">
                    Mentions
                  </Label>
                  <p className="text-sm text-muted-foreground">When someone mentions you in a comment</p>
                </div>
              </div>
              <Switch id="mentions" checked={mentions} onCheckedChange={setMentions} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="collaborator-joined" className="text-sm font-medium text-foreground">
                    Collaborator Joined
                  </Label>
                  <p className="text-sm text-muted-foreground">When a new collaborator joins your document</p>
                </div>
              </div>
              <Switch id="collaborator-joined" checked={collaboratorJoined} onCheckedChange={setCollaboratorJoined} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
