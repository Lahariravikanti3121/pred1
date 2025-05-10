"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2, User, Bell, Shield, LogOut } from "lucide-react"

export default function PatientSettings() {
  const { userData, updateUserData, logout } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: userData?.displayName || "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    emergencyContact: "",
    medicalConditions: "",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailAppointmentReminders: true,
    emailReportNotifications: true,
    emailPromotions: false,
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: checked }))
  }

  const handleUpdateProfile = async () => {
    if (!userData) return

    setIsUpdating(true)

    try {
      // Update user profile in Firestore
      const userRef = doc(db, "patients", userData.uid)
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: new Date(),
      })

      // Update display name in auth context if changed
      if (profileData.fullName !== userData.displayName) {
        await updateUserData({ displayName: profileData.fullName })
      }

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateNotifications = async () => {
    if (!userData) return

    setIsUpdating(true)

    try {
      // Update notification settings in Firestore
      const userRef = doc(db, "patients", userData.uid)
      await updateDoc(userRef, {
        notificationSettings,
        updatedAt: new Date(),
      })

      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating notification settings:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating your notification settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      // Redirect happens automatically via auth state change
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and medical information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" value={profileData.fullName} onChange={handleProfileChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={profileData.address} onChange={handleProfileChange} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  name="medicalConditions"
                  placeholder="List any chronic conditions, allergies, or other important medical information"
                  value={profileData.medicalConditions}
                  onChange={handleProfileChange}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleUpdateProfile} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-y-2">
                <div className="space-y-0.5">
                  <Label htmlFor="emailAppointmentReminders">Appointment Reminders</Label>
                  <p className="text-sm text-muted-foreground">Receive email reminders about upcoming appointments</p>
                </div>
                <Switch
                  id="emailAppointmentReminders"
                  checked={notificationSettings.emailAppointmentReminders}
                  onCheckedChange={(checked) => handleNotificationChange("emailAppointmentReminders", checked)}
                />
              </div>

              <div className="flex items-center justify-between space-y-2">
                <div className="space-y-0.5">
                  <Label htmlFor="emailReportNotifications">Report Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications when new reports are available
                  </p>
                </div>
                <Switch
                  id="emailReportNotifications"
                  checked={notificationSettings.emailReportNotifications}
                  onCheckedChange={(checked) => handleNotificationChange("emailReportNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between space-y-2">
                <div className="space-y-0.5">
                  <Label htmlFor="emailPromotions">Promotional Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive emails about new features and health tips</p>
                </div>
                <Switch
                  id="emailPromotions"
                  checked={notificationSettings.emailPromotions}
                  onCheckedChange={(checked) => handleNotificationChange("emailPromotions", checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={handleUpdateNotifications}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your account security and data privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Account Security</h3>
                  <p className="text-sm text-muted-foreground">Manage your password and account security settings</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Button variant="outline">Change Password</Button>
                  <Button variant="outline">Enable Two-Factor Authentication</Button>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div>
                  <h3 className="text-lg font-medium">Data Privacy</h3>
                  <p className="text-sm text-muted-foreground">Manage how your data is used and stored</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Button variant="outline">Download My Data</Button>
                  <Button variant="outline" className="text-red-500">
                    Delete My Account
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 w-full">
                <div className="flex items-start gap-2">
                  <Shield className="mt-0.5 h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Data Protection</p>
                    <p className="text-sm text-yellow-700">
                      Your health data is encrypted and protected in accordance with HIPAA regulations. We never share
                      your personal information without your explicit consent.
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="destructive" className="flex items-center gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
