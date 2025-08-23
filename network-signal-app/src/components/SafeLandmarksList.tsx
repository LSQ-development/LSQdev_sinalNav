import { Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SafeLandmark {
  id: string
  name: string
  type: string
  rating: number
}

interface SafeLandmarksListProps {
  safeLandmarks: SafeLandmark[]
}

export function SafeLandmarksList({ safeLandmarks }: SafeLandmarksListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Safe Landmarks Nearby
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeLandmarks.slice(0, 4).map((landmark) => (
            <div key={landmark.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium text-sm">{landmark.name}</div>
                <div className="text-xs text-gray-500">{landmark.type}</div>
              </div>
              <Badge variant="outline" className="text-xs">
                ★ {landmark.rating}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
