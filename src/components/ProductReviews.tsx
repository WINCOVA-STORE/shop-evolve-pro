import { useState } from "react";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useProductReviews } from "@/hooks/useReviews";
import { ReviewForm } from "./ReviewForm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { data: reviews, isLoading } = useProductReviews(productId);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { t } = useTranslation();

  if (isLoading) {
    return <div className="text-center py-8">{t("reviews.loading_reviews")}</div>;
  }

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = reviews?.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("reviews.customer_opinions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
                <div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= averageRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reviews?.length || 0} {t("reviews.reviews")}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingCounts[rating] || 0;
                const percentage = reviews?.length
                  ? (count / reviews.length) * 100
                  : 0;
                return (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="w-full md:w-auto"
          >
            {showReviewForm ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                {t("reviews.cancel")}
              </>
            ) : (
              <>
                {t("reviews.write_review")}
              </>
            )}
          </Button>

          {showReviewForm && (
            <div className="mt-4">
              <ReviewForm
                productId={productId}
                onSuccess={() => setShowReviewForm(false)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {reviews?.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={review.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {review.profiles?.full_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">
                    {review.profiles?.full_name || "Usuario"}
                    </span>
                    {review.is_verified_purchase && (
                      <Badge variant="secondary" className="text-xs">
                        {t("reviews.verified_purchase")}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </span>
                  </div>
                  
                  {review.title && (
                    <h4 className="font-semibold">{review.title}</h4>
                  )}
                  
                  {review.comment && (
                    <p className="text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};