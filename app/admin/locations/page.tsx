import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CountriesTab } from "@/components/admin/locations/countries-tab"
import { StatesTab } from "@/components/admin/locations/states-tab"
import { CitiesTab } from "@/components/admin/locations/cities-tab"

export default async function LocationsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const [{ data: countries }, { data: states }, { data: cities }] = await Promise.all([
    supabase.from("countries").select("*").order("name"),
    supabase.from("states").select("*, countries(name)").order("name"),
    supabase.from("cities").select("*, states(name, countries(name))").order("name"),
  ])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Location Management</h1>
        <p className="text-muted-foreground">Manage countries, states, and cities</p>
      </div>

      <Tabs defaultValue="countries" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
        </TabsList>
        <TabsContent value="countries">
          <CountriesTab countries={countries || []} />
        </TabsContent>
        <TabsContent value="states">
          <StatesTab states={states || []} countries={countries || []} />
        </TabsContent>
        <TabsContent value="cities">
          <CitiesTab cities={cities || []} states={states || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
