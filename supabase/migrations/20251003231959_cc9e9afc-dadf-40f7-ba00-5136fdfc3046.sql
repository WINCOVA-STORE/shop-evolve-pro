-- Create reviews table for product reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, order_id)
);

-- Add birthday field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birthday DATE;

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view approved reviews" 
ON public.reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.reviews 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews" 
ON public.reviews 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to update reviews updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to grant points for purchase
CREATE OR REPLACE FUNCTION public.grant_purchase_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  points_earned NUMERIC;
BEGIN
  -- Only grant points when payment is completed
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    -- Calculate 1% of total as points
    points_earned := ROUND(NEW.total * 0.01);
    
    INSERT INTO public.rewards (user_id, type, amount, description, order_id)
    VALUES (
      NEW.user_id, 
      'purchase', 
      points_earned, 
      'Puntos por compra #' || NEW.order_number,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to grant points on order completion
CREATE TRIGGER grant_purchase_points_trigger
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.grant_purchase_points();

-- Function to grant points for reviews
CREATE OR REPLACE FUNCTION public.grant_review_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Grant 100 points for leaving a review
  INSERT INTO public.rewards (user_id, type, amount, description)
  VALUES (
    NEW.user_id, 
    'review', 
    100, 
    'Puntos por dejar una reseña'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to grant points on review creation
CREATE TRIGGER grant_review_points_trigger
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.grant_review_points();

-- Function to check and grant birthday points (to be called by edge function)
CREATE OR REPLACE FUNCTION public.grant_birthday_points(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_birthday DATE;
  last_birthday_reward TIMESTAMP;
  current_year INTEGER;
BEGIN
  -- Get user's birthday
  SELECT birthday INTO user_birthday
  FROM public.profiles
  WHERE id = target_user_id;
  
  IF user_birthday IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if it's their birthday today
  IF EXTRACT(MONTH FROM user_birthday) != EXTRACT(MONTH FROM CURRENT_DATE) OR
     EXTRACT(DAY FROM user_birthday) != EXTRACT(DAY FROM CURRENT_DATE) THEN
    RETURN false;
  END IF;
  
  -- Check if they already received birthday points this year
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  SELECT created_at INTO last_birthday_reward
  FROM public.rewards
  WHERE user_id = target_user_id 
    AND type = 'birthday'
    AND EXTRACT(YEAR FROM created_at) = current_year
  LIMIT 1;
  
  IF last_birthday_reward IS NOT NULL THEN
    RETURN false;
  END IF;
  
  -- Grant birthday points
  INSERT INTO public.rewards (user_id, type, amount, description)
  VALUES (
    target_user_id,
    'birthday',
    500,
    '¡Feliz cumpleaños! Puntos especiales para ti'
  );
  
  RETURN true;
END;
$$;