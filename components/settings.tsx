"use client"

import type React from "react"

import { useState } from "react"
import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"

interface SettingsProps {
  mode: "letters" | "numbers" | "shuffle"
  setMode: (mode: "letters" | "numbers" | "shuffle") => void
  maxNumberOption: "10" | "20" | "50" | "100" | "custom"
  setMaxNumberOption: (option: "10" | "20" | "50" | "100" | "custom") => void
  customMaxNumber: number
  setCustomMaxNumber: (value: number) => void
}

export function Settings({
  mode,
  setMode,
  maxNumberOption,
  setMaxNumberOption,
  customMaxNumber,
  setCustomMaxNumber,
}: SettingsProps) {
  const [open, setOpen] = useState(false)

  const handleCustomMaxNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10)
    if (!isNaN(value) && value > 0 && value <= 1000) {
      setCustomMaxNumber(value)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-14 w-14 border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] transition-all bg-white dark:bg-black"
        >
          <Settings2 className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="rounded-t-3xl border-t-4 border-x-4 border-black dark:border-white bg-white dark:bg-black">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">Settings</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 pb-8 space-y-8">
            <div className="space-y-3">
              <Label htmlFor="mode" className="text-lg font-bold">
                Mode
              </Label>
              <RadioGroup
                id="mode"
                value={mode}
                onValueChange={(value) => setMode(value as "letters" | "numbers" | "shuffle")}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="letters" id="letters" className="h-6 w-6" />
                  <Label htmlFor="letters" className="text-lg">
                    Letters (A-Z)
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="numbers" id="numbers" className="h-6 w-6" />
                  <Label htmlFor="numbers" className="text-lg">
                    Numbers
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="shuffle" id="shuffle-mode" className="h-6 w-6" />
                  <Label htmlFor="shuffle-mode" className="text-lg">
                    Shuffle (Letters & Numbers)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {(mode === "numbers" || mode === "shuffle") && (
              <div className="space-y-3">
                <Label htmlFor="max-number" className="text-lg font-bold">
                  Maximum Number
                </Label>
                <RadioGroup
                  id="max-number"
                  value={maxNumberOption}
                  onValueChange={(value) => setMaxNumberOption(value as "10" | "20" | "50" | "100" | "custom")}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="10" id="max-10" className="h-6 w-6" />
                    <Label htmlFor="max-10" className="text-lg">
                      0-10
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="20" id="max-20" className="h-6 w-6" />
                    <Label htmlFor="max-20" className="text-lg">
                      0-20
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="50" id="max-50" className="h-6 w-6" />
                    <Label htmlFor="max-50" className="text-lg">
                      0-50
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="100" id="max-100" className="h-6 w-6" />
                    <Label htmlFor="max-100" className="text-lg">
                      0-100
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="custom" id="max-custom" className="h-6 w-6" />
                    <Label htmlFor="max-custom" className="text-lg">
                      Custom
                    </Label>
                  </div>

                  {maxNumberOption === "custom" && (
                    <div className="pl-9 pt-2">
                      <Input
                        type="number"
                        min="1"
                        max="1000"
                        value={customMaxNumber}
                        onChange={handleCustomMaxNumberChange}
                        className="w-28 h-12 text-lg border-2 rounded-xl bg-white dark:bg-black"
                      />
                    </div>
                  )}
                </RadioGroup>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label className="text-lg font-bold">Theme</Label>
              <ModeToggle />
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
