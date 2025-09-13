"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, Coins, ShoppingCart, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface VirtualTownProps {
  userId: string
}

interface BuildingType {
  id: string
  name: string
  description: string
  cost: number
  category: string
  icon: string
  unlock_level: number
}

interface UserBuilding {
  id: string
  building_type_id: string
  position_x: number
  position_y: number
  building_types: BuildingType
}

interface CitizenGroup {
  id: string
  name: string
  description: string
  cost: number
  icon: string
  category: string
  population: number
}

interface Citizen {
  id: string
  x: number
  y: number
  targetX: number
  targetY: number
  icon: string
  groupId: string
}

export function VirtualTown({ userId }: VirtualTownProps) {
  const [bucks, setBucks] = useState(0)
  const [userBuildings, setUserBuildings] = useState<UserBuilding[]>([])
  const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([])
  const [citizenGroups, setCitizenGroups] = useState<CitizenGroup[]>([])
  const [userCitizenGroups, setUserCitizenGroups] = useState<CitizenGroup[]>([])
  const [citizens, setCitizens] = useState<Citizen[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTab, setSelectedTab] = useState("buildings")

  useEffect(() => {
    const defaultBuildingTypes: BuildingType[] = [
      {
        id: "1",
        name: "Small House",
        description: "A cozy starter home",
        cost: 50,
        category: "residential",
        icon: "🏠",
        unlock_level: 1,
      },
      {
        id: "2",
        name: "Shop",
        description: "A small retail store",
        cost: 75,
        category: "commercial",
        icon: "🏪",
        unlock_level: 1,
      },
      {
        id: "3",
        name: "Tree",
        description: "Beautiful greenery",
        cost: 25,
        category: "infrastructure",
        icon: "🌳",
        unlock_level: 1,
      },
      {
        id: "4",
        name: "Apartment",
        description: "Multi-story housing",
        cost: 120,
        category: "residential",
        icon: "🏢",
        unlock_level: 2,
      },
      {
        id: "5",
        name: "Restaurant",
        description: "A place to dine",
        cost: 150,
        category: "commercial",
        icon: "🍽️",
        unlock_level: 2,
      },
      {
        id: "6",
        name: "Park",
        description: "Recreational area",
        cost: 100,
        category: "entertainment",
        icon: "🏞️",
        unlock_level: 2,
      },
      {
        id: "7",
        name: "Office Building",
        description: "Modern commercial space",
        cost: 200,
        category: "commercial",
        icon: "🏬",
        unlock_level: 3,
      },
      {
        id: "8",
        name: "School",
        description: "Education facility",
        cost: 250,
        category: "infrastructure",
        icon: "🏫",
        unlock_level: 3,
      },
      {
        id: "9",
        name: "Hospital",
        description: "Healthcare facility",
        cost: 300,
        category: "infrastructure",
        icon: "🏥",
        unlock_level: 4,
      },
      {
        id: "10",
        name: "Stadium",
        description: "Sports venue",
        cost: 500,
        category: "entertainment",
        icon: "🏟️",
        unlock_level: 5,
      },
    ]

    setBuildingTypes(defaultBuildingTypes)

    const spendingData = JSON.parse(localStorage.getItem(`transactions_${userId}`) || "[]")
    const spendingCategories = analyzeSpendingPatterns(spendingData)
    const generatedCitizenGroups = generateCitizenGroups(spendingCategories)
    setCitizenGroups(generatedCitizenGroups)

    // Load saved data
    const savedBucks = Number.parseInt(localStorage.getItem(`bucks_${userId}`) || "100")
    const savedBuildings = JSON.parse(localStorage.getItem(`buildings_${userId}`) || "[]")
    const savedCitizenGroups = JSON.parse(localStorage.getItem(`citizen_groups_${userId}`) || "[]")

    setBucks(savedBucks)
    setUserBuildings(savedBuildings)
    setUserCitizenGroups(savedCitizenGroups)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    const interval = setInterval(() => {
      setCitizens((prevCitizens) =>
        prevCitizens.map((citizen) => {
          const dx = citizen.targetX - citizen.x
          const dy = citizen.targetY - citizen.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 0.1) {
            // Reached target, set new random target
            return {
              ...citizen,
              targetX: Math.random() * 8,
              targetY: Math.random() * 8,
            }
          }

          // Move towards target
          const speed = 0.02
          return {
            ...citizen,
            x: citizen.x + (dx / distance) * speed,
            y: citizen.y + (dy / distance) * speed,
          }
        }),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const newCitizens: Citizen[] = []
    userCitizenGroups.forEach((group) => {
      for (let i = 0; i < group.population; i++) {
        newCitizens.push({
          id: `${group.id}_${i}`,
          x: Math.random() * 8,
          y: Math.random() * 8,
          targetX: Math.random() * 8,
          targetY: Math.random() * 8,
          icon: group.icon,
          groupId: group.id,
        })
      }
    })
    setCitizens(newCitizens)
  }, [userCitizenGroups])

  const analyzeSpendingPatterns = (transactions: any[]) => {
    const categories: { [key: string]: number } = {}

    transactions.forEach((transaction) => {
      if (transaction.amount < 0) {
        // Only spending transactions
        const category = transaction.category || "general"
        categories[category] = (categories[category] || 0) + Math.abs(transaction.amount)
      }
    })

    return Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5) // Top 5 categories
      .map(([category, amount]) => ({ category, amount }))
  }

  const generateCitizenGroups = (spendingCategories: any[]): CitizenGroup[] => {
    const citizenGroupTemplates: { [key: string]: CitizenGroup } = {
      food: {
        id: "food",
        name: "Food Workers",
        description: "Chefs, servers, and food vendors",
        cost: 80,
        icon: "👨‍🍳",
        category: "food",
        population: 3,
      },
      transport: {
        id: "transport",
        name: "Transport Workers",
        description: "Drivers, mechanics, and logistics",
        cost: 100,
        icon: "🚗",
        category: "transport",
        population: 4,
      },
      shopping: {
        id: "shopping",
        name: "Retail Workers",
        description: "Shop assistants and cashiers",
        cost: 60,
        icon: "🛒",
        category: "shopping",
        population: 5,
      },
      entertainment: {
        id: "entertainment",
        name: "Entertainment Crew",
        description: "Artists, performers, and event staff",
        cost: 120,
        icon: "🎭",
        category: "entertainment",
        population: 3,
      },
      healthcare: {
        id: "healthcare",
        name: "Healthcare Workers",
        description: "Doctors, nurses, and medical staff",
        cost: 150,
        icon: "👩‍⚕️",
        category: "healthcare",
        population: 2,
      },
      education: {
        id: "education",
        name: "Educators",
        description: "Teachers and education support",
        cost: 110,
        icon: "👨‍🏫",
        category: "education",
        population: 3,
      },
      general: {
        id: "general",
        name: "General Workers",
        description: "Various community workers",
        cost: 70,
        icon: "👷",
        category: "general",
        population: 4,
      },
    }

    const groups: CitizenGroup[] = []

    // Add citizen groups based on top spending categories
    spendingCategories.forEach(({ category }) => {
      if (citizenGroupTemplates[category]) {
        groups.push(citizenGroupTemplates[category])
      }
    })

    // Always include general workers if no specific categories found
    if (groups.length === 0) {
      groups.push(citizenGroupTemplates.general)
    }

    return groups
  }

  const purchaseBuilding = (buildingType: BuildingType) => {
    if (bucks < buildingType.cost) return

    // Find an empty spot in the grid
    const gridSize = 8
    let position_x = 0
    let position_y = 0

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const occupied = userBuildings.some((b) => b.position_x === x && b.position_y === y)
        if (!occupied) {
          position_x = x
          position_y = y
          break
        }
      }
      if (position_x !== 0 || position_y !== 0) break
    }

    const newBuilding: UserBuilding = {
      id: Date.now().toString(),
      building_type_id: buildingType.id,
      position_x,
      position_y,
      building_types: buildingType,
    }

    const newBucks = bucks - buildingType.cost
    const newBuildings = [...userBuildings, newBuilding]

    setUserBuildings(newBuildings)
    setBucks(newBucks)

    // Save to localStorage
    localStorage.setItem(`buildings_${userId}`, JSON.stringify(newBuildings))
    localStorage.setItem(`bucks_${userId}`, newBucks.toString())
  }

  const purchaseCitizenGroup = (citizenGroup: CitizenGroup) => {
    if (bucks < citizenGroup.cost) return

    const newBucks = bucks - citizenGroup.cost
    const newCitizenGroups = [...userCitizenGroups, citizenGroup]

    setUserCitizenGroups(newCitizenGroups)
    setBucks(newBucks)

    // Save to localStorage
    localStorage.setItem(`citizen_groups_${userId}`, JSON.stringify(newCitizenGroups))
    localStorage.setItem(`bucks_${userId}`, newBucks.toString())
  }

  const getUserLevel = () => {
    return Math.floor(userBuildings.length / 3) + 1
  }

  const getAvailableBuildings = () => {
    const userLevel = getUserLevel()
    let filtered = buildingTypes.filter((bt) => bt.unlock_level <= userLevel)

    if (selectedCategory !== "all") {
      filtered = filtered.filter((bt) => bt.category === selectedCategory)
    }

    return filtered
  }

  const renderTownGrid = () => {
    const gridSize = 8
    const grid = []

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const building = userBuildings.find((b) => b.position_x === x && b.position_y === y)
        const citizensInCell = citizens.filter((c) => Math.floor(c.x) === x && Math.floor(c.y) === y)

        grid.push(
          <div
            key={`${x}-${y}`}
            className="w-12 h-12 border border-orange-200 rounded-lg flex items-center justify-center bg-orange-50 hover:bg-orange-100 transition-colors relative overflow-hidden"
          >
            {building ? (
              <span className="text-2xl z-10" title={building.building_types.name}>
                {building.building_types.icon}
              </span>
            ) : (
              <div className="w-2 h-2 bg-orange-300 rounded-full opacity-50" />
            )}

            {citizensInCell.map((citizen) => (
              <span
                key={citizen.id}
                className="absolute text-xs transition-all duration-100 z-20"
                style={{
                  left: `${(citizen.x % 1) * 100}%`,
                  top: `${(citizen.y % 1) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                title={`Citizen from ${userCitizenGroups.find((g) => g.id === citizen.groupId)?.name}`}
              >
                {citizen.icon}
              </span>
            ))}
          </div>,
        )
      }
    }

    return (
      <div className="grid grid-cols-8 gap-1 p-4 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg">
        {grid}
      </div>
    )
  }

  if (loading) {
    return (
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Building className="h-5 w-5" />
            Your Virtual Town
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Building your town...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Building className="h-5 w-5" />
          Your Virtual Town
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-bold text-lg">{bucks} Bucks</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Level {getUserLevel()}</Badge>
            <Badge variant="outline" className="border-orange-300">
              <Users className="h-3 w-3 mr-1" />
              {citizens.length} Citizens
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderTownGrid()}

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Buildings: {userBuildings.length} | Citizens: {citizens.length} | Earn bucks by making good financial
            decisions!
          </p>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
                <ShoppingCart className="h-4 w-4" />
                Shop
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Town Shop</DialogTitle>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold">{bucks} Bucks Available</span>
                </div>
              </DialogHeader>

              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buildings">🏗️ Buildings</TabsTrigger>
                  <TabsTrigger value="citizens">👥 Citizen Groups</TabsTrigger>
                </TabsList>

                <TabsContent value="buildings">
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="residential">🏠 Home</TabsTrigger>
                      <TabsTrigger value="commercial">🏪 Shop</TabsTrigger>
                      <TabsTrigger value="entertainment">🎪 Fun</TabsTrigger>
                      <TabsTrigger value="infrastructure">🏗️ City</TabsTrigger>
                    </TabsList>

                    <TabsContent value={selectedCategory} className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {getAvailableBuildings().map((buildingType) => (
                          <Card key={buildingType.id} className="p-4 border-orange-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{buildingType.icon}</span>
                                <div>
                                  <h3 className="font-semibold">{buildingType.name}</h3>
                                  <p className="text-sm text-gray-600">{buildingType.description}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Coins className="h-4 w-4 text-yellow-500" />
                                <span className="font-bold">{buildingType.cost}</span>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => purchaseBuilding(buildingType)}
                                disabled={bucks < buildingType.cost}
                                className="bg-orange-500 hover:bg-orange-600"
                              >
                                Buy
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="citizens">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Citizen groups based on your spending patterns. Each group adds animated citizens to your town!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {citizenGroups
                        .filter((group) => !userCitizenGroups.some((ug) => ug.id === group.id))
                        .map((citizenGroup) => (
                          <Card key={citizenGroup.id} className="p-4 border-orange-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{citizenGroup.icon}</span>
                                <div>
                                  <h3 className="font-semibold">{citizenGroup.name}</h3>
                                  <p className="text-sm text-gray-600">{citizenGroup.description}</p>
                                  <p className="text-xs text-orange-600">+{citizenGroup.population} citizens</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Coins className="h-4 w-4 text-yellow-500" />
                                <span className="font-bold">{citizenGroup.cost}</span>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => purchaseCitizenGroup(citizenGroup)}
                                disabled={bucks < citizenGroup.cost}
                                className="bg-orange-500 hover:bg-orange-600"
                              >
                                Hire
                              </Button>
                            </div>
                          </Card>
                        ))}
                    </div>

                    {userCitizenGroups.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold mb-2">Your Citizen Groups:</h3>
                        <div className="flex flex-wrap gap-2">
                          {userCitizenGroups.map((group) => (
                            <Badge key={group.id} variant="secondary" className="border-orange-300">
                              {group.icon} {group.name} ({group.population})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
