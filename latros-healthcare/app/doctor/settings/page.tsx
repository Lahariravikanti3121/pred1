"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2, User, Bell, Shield, LogOut, Calendar } from "lucide-react"

// List of medical specializations
const specializations = [
  "General Medicine",
  "Cardiologist",
  "Orthopedic",
  "Dermatologist",
  "Neurologist",
  "ENT",
  "Gynecologist",
  "Psychiatrist",
  "Pulmonologist",
  "Pediatrician",
]

export default function DoctorSettings() {
  const { userData, updateUserData, logout } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: userData?.displayName || "",
    phoneNumber: "",
    specialty: "",
    qualifications: "",
    experience: "",
    bio: "",
    consultationFee: "",
  })

  const [availabilitySettings, setAvailabilitySettings] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
    morningShift: true,
    afternoonShift: true,
    eveningShift: false,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailAppointmentAlerts: true,
    emailPatientMessages: true,
    emailSystemUpdates: false,
  })

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!userData) return

      try {
        const doctorRef = doc(db, "doctors", userData.uid)
        const doctorSnap = await getDoc(doctorRef)

        if (doctorSnap.exists()) {
          const doctorData = doctorSnap.data()
          setProfileData((prev) => ({
            ...prev,
            phoneNumber: doctorData.phoneNumber || "",
            specialty: doctorData.specialty || "",
            qualifications: doctorData.qualifications || "",
            experience: doctorData.experience || "",
            bio: doctorData.bio || "",
            consultationFee: doctorData.consultationFee || "",
          }))
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile data.",
          variant: "destructive",
        })
      }
    }

    fetchDoctorData()
  }, [userData])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvailabilityChange = (key: string, checked: boolean) => {
    setAvailabilitySettings((prev) => ({ ...prev, [key]: checked }))
  }

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: checked }))
  }

  const handleSpecialtyChange = (value: string) => {
    setProfileData((prev) => ({ ...prev, specialty: value }))
  }

  const handleUpdateProfile = async () => {
    if (!userData) return

    setIsUpdating(true)

    try {
      // Update doctor profile in Firestore
      const doctorRef = doc(db, "doctors", userData.uid)
      await updateDoc(doctorRef, {
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

  const handleUpdateAvailability = async () => {
    if (!userData) return

    setIsUpdating(true)

    try {
      // Update availability settings in Firestore
      const doctorRef = doc(db, "doctors", userData.uid)
      await updateDoc(doctorRef, {
        availability: availabilitySettings,
        updatedAt: new Date(),
      })

      toast({
        title: "Availability updated",
        description: "Your availability settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating availability:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating your availability. Please try again.",
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
      const doctorRef = doc(db, "doctors", userData.uid)
      await updateDoc(doctorRef, {
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
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Availability
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
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Update your professional details and qualifications</CardDescription>
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialization</Label>
                  <Select value={profileData.specialty} onValueChange={handleSpecialtyChange}>
                    <SelectTrigger id="specialty">
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((specialization) => (
                        <SelectItem key={specialization} value={specialization}>
                          {specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultationFee">Consultation Fee</Label>
                  <Input
                    id="consultationFee"
                    name="consultationFee"
                    value={profileData.consultationFee}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Input
                  id="qualifications"
                  name="qualifications"
                  value={profileData.qualifications}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  name="experience"
                  value={profileData.experience}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell patients about your professional background and expertise"
                  value={profileData.bio}
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

        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle>Availability Settings</CardTitle>
              <CardDescription>Set your working days and hours for appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium">Working Days</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="monday"
                      checked={availabilitySettings.monday}
                      onCheckedChange={(checked) => handleAvailabilityChange("monday", checked)}
                    />
                    <Label htmlFor="monday">Monday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tuesday"
                      checked={availabilitySettings.tuesday}
                      onCheckedChange={(checked) => handleAvailabilityChange("tuesday", checked)}
                    />
                    <Label htmlFor="tuesday">Tuesday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="wednesday"
                      checked={availabilitySettings.wednesday}
                      onCheckedChange={(checked) => handleAvailabilityChange("wednesday", checked)}
                    />
                    <Label htmlFor="wednesday">Wednesday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="thursday"
                      checked={availabilitySettings.thursday}
                      onCheckedChange={(checked) => handleAvailabilityChange("thursday", checked)}
                    />
                    <Label htmlFor="thursday">Thursday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="friday"
                      checked={availabilitySettings.friday}
                      onCheckedChange={(checked) => handleAvailabilityChange("friday", checked)}
                    />
                    <Label htmlFor="friday">Friday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="saturday"
                      checked={availabilitySettings.saturday}
                      onCheckedChange={(checked) => handleAvailabilityChange("saturday", checked)}
                    />
                    <Label htmlFor="saturday">Saturday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sunday"
                      checked={availabilitySettings.sunday}
                      onCheckedChange={(checked) => handleAvailabilityChange("sunday", checked)}
                    />
                    <Label htmlFor="sunday">Sunday</Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium">Working Hours</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="morningShift"
                      checked={availabilitySettings.morningShift}
                      onCheckedChange={(checked) => handleAvailabilityChange("morningShift", checked)}
                    />
                    <Label htmlFor="morningShift">Morning (9 AM - 12 PM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="afternoonShift"
                      checked={availabilitySettings.afternoonShift}
                      onCheckedChange={(checked) => handleAvailabilityChange("afternoonShift", checked)}
                    />
                    <Label htmlFor="afternoonShift">Afternoon (1 PM - 5 PM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="eveningShift"
                      checked={availabilitySettings.eveningShift}
                      onCheckedChange={(checked) => handleAvailabilityChange("eveningShift", checked)}
                    />
                    <Label htmlFor="eveningShift">Evening (6 PM - 9 PM)</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={handleUpdateAvailability}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Availability"
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
                  <Label htmlFor="emailAppointmentAlerts">Appointment Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts about new appointment requests and changes
                  </p>
                </div>
                <Switch
                  id="emailAppointmentAlerts"
                  checked={notificationSettings.emailAppointmentAlerts}
                  onCheckedChange={(checked) => handleNotificationChange("emailAppointmentAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between space-y-2">
                <div className="space-y-0.5">
                  <Label htmlFor="emailPatientMessages">Patient Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications when patients send you messages
                  </p>
                </div>
                <Switch
                  id="emailPatientMessages"
                  checked={notificationSettings.emailPatientMessages}
                  onCheckedChange={(checked) => handleNotificationChange("emailPatientMessages", checked)}
                />
              </div>

              <div className="flex items-center justify-between space-y-2">
                <div className="space-y-0.5">
                  <Label htmlFor="emailSystemUpdates">System Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about platform updates and new features
                  </p>
                </div>
                <Switch
                  id="emailSystemUpdates"
                  checked={notificationSettings.emailSystemUpdates}
                  onCheckedChange={(checked) => handleNotificationChange("emailSystemUpdates", checked)}
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
                      Patient data is encrypted and protected in accordance with HIPAA regulations. We never share
                      patient information without explicit consent.
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
