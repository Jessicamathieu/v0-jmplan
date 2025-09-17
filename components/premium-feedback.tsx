"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, Send, Heart, Sparkles } from "lucide-react"

export function PremiumFeedback() {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (rating > 0) {
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  if (submitted) {
    return (
      <Card className="premium-card border-2 border-primary/20">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary to-secondary">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">Merci pour votre retour !</h3>
          <p className="text-muted-foreground">Votre avis nous aide à améliorer constamment JM Plan Premium</p>
          <div className="flex justify-center mt-4">
            <Badge className="premium-gradient text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Feedback Premium reçu
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Star className="h-5 w-5" />
          Votre avis compte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-3">Comment évaluez-vous votre expérience avec JM Plan ?</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-all duration-200 hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating ? "text-yellow-400 fill-current" : "text-gray-300 hover:text-yellow-200"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <Textarea
          placeholder="Partagez vos commentaires ou suggestions..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="premium-border"
        />

        <Button onClick={handleSubmit} disabled={rating === 0} className="w-full premium-button">
          <Send className="h-4 w-4 mr-2" />
          Envoyer mon avis
        </Button>
      </CardContent>
    </Card>
  )
}
