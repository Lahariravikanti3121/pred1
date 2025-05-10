"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { doc, updateDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General",
  "Neurology",
  "Obstetrics",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Urology",
]

interface DoctorProfile {
  userId: string
  name: string
  email: string
  specialization: string
  bio: string
  qualifications: string
  experience: number
  acceptingNewPatients: boolean
}

export default function DoctorProfilePage() {
  const { userData } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<DoctorProfile>({
    userId: "",
    name: "",
    email: "",
    specialization: "General",
    bio: "",
    qualifications: "",
    experience: 0,
    acceptingNewPatients: true,
  })

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!userData) return

      try {
        setLoading(true)

        // Check if doctor profile exists
        const doctorSnap = await getDocs(query(collection(db, "doctors"), where("userId", "==", userData.uid)))

        if (!doctorSnap.empty) {
          const doctorData = doctorSnap.docs[0].data() as DoctorProfile
          setProfile({
            ...doctorData,
            name: userData.displayName || doctorData.name,
            email: userData.email || doctorData.email,
          })
        } else {
          // Initialize with user data
          setProfile({
            userId: userData.uid,
            name: userData.displayName || "",
            email: userData.email || "",
            specialization: "General",
            bio: "",
            qualifications: "",
            experience: 0,
            acceptingNewPatients: true,
          })
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorProfile()
  }, [userData])

  const handleChange = (field: keyof DoctorProfile, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userData) return

    try {
      setSaving(true)

      // Check if doctor profile exists
      const doctorSnap = await getDocs(query(collection(db, "doctors"), where("userId", "==", userData.uid)))

      if (!doctorSnap.empty) {
        // Update existing profile
        await updateDoc(doc(db, "doctors", doctorSnap.docs[0].id), {
          ...profile,
          updatedAt: new Date(),
        })
      } else {
        // Create new profile
        await setDoc(doc(collection(db, "doctors")), {
          ...profile,
          userId: userData.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      toast({
        title: "Profile updated",
        description: "Your doctor profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error saving doctor profile:", error)
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-lg">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doctor Profile</h1>
        <p className="text-muted-foreground">Update your professional information and specialization</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic information visible to patients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={profile.name} onChange={(e) => handleChange("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
            <CardDescription>Your medical specialization and qualifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialization">Medical Specialization</Label>
              <Select value={profile.specialization} onValueChange={(value) => handleChange("specialization", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATIONS.map((spec) => (
                    <SelectItem key={spec} value={spec.toLowerCase()}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You will only receive appointment requests related to your specialization
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications</Label>
              <Input
                id="qualifications"
                value={profile.qualifications}
                onChange={(e) => handleChange("qualifications", e.target.value)}
                placeholder="MD, PhD, Board Certifications, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="70"
                value={profile.experience}
                onChange={(e) => handleChange("experience", Number.parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <textarea
                id="bio"
                className="h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={profile.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Tell patients about your background, approach to care, and areas of expertise"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="acceptingNewPatients"
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                checked={profile.acceptingNewPatients}
                onChange={(e) => handleChange("acceptingNewPatients", e.target.checked)}
              />
              <Label htmlFor="acceptingNewPatients">Currently accepting new patients</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
