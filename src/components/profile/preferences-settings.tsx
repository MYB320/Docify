"use client"

import { useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PreferencesSettings() {
  const [theme, setTheme] = useState("system")

  return (
    <Card id="preferences">
      <CardHeader>
        <CardTitle className="text-foreground">Preferences</CardTitle>
        <CardDescription>Customize your app experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Appearance</h3>
          <RadioGroup value={theme} onValueChange={setTheme} className="grid gap-4">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex flex-1 cursor-pointer items-center gap-3">
                <Sun className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">Light</p>
                  <p className="text-sm text-muted-foreground">Use light theme</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex flex-1 cursor-pointer items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">Dark</p>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="flex flex-1 cursor-pointer items-center gap-3">
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">System</p>
                  <p className="text-sm text-muted-foreground">Use system theme</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="border-t border-border pt-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Language & Region</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="pst">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                    <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                    <SelectItem value="cst">Central Time (CT)</SelectItem>
                    <SelectItem value="est">Eastern Time (ET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Editor Preferences</h3>
            <div className="space-y-2">
              <Label htmlFor="font-size">Default Font Size</Label>
              <Select defaultValue="medium">
                <SelectTrigger id="font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-6">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>Save Preferences</Button>
        </div>
      </CardContent>
    </Card>
  )
}
