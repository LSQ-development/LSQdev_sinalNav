import { Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CellTower {
  id: string
  carrier: string
  frequency: string
  strength: number
  capacity: number
  currentLoad: number
}

interface CellTowerListProps {
  cellTowers: CellTower[]
}

export function CellTowerList({ cellTowers }: CellTowerListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Nearby Cell Towers (South Africa)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {cellTowers.map((tower) => {
            const loadPercentage = Math.round((tower.currentLoad / tower.capacity) * 100)
            const loadColor =
              loadPercentage > 80 ? "text-red-600" : loadPercentage > 60 ? "text-yellow-600" : "text-green-600"

            return (
              <div key={tower.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div>
                    <div className="font-medium">{tower.carrier}</div>
                    <div className="text-sm text-gray-500">
                      {tower.frequency} | ID: {tower.id}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{tower.strength}%</div>
                  <div className="text-xs text-gray-500">Signal</div>
                  <div className={`text-xs ${loadColor}`}>Load: {loadPercentage}%</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
