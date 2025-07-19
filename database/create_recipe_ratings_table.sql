-- Create recipe_ratings table
CREATE TABLE recipe_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_recipe_ratings_recipe_id 
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_ratings_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate ratings (one rating per user per recipe)
    CONSTRAINT recipe_ratings_user_id_recipe_id_key 
        UNIQUE (user_id, recipe_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_recipe_ratings_recipe_id ON recipe_ratings(recipe_id);
CREATE INDEX idx_recipe_ratings_user_id ON recipe_ratings(user_id);
CREATE INDEX idx_recipe_ratings_rating ON recipe_ratings(rating);
CREATE INDEX idx_recipe_ratings_created_at ON recipe_ratings(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipe_ratings_updated_at 
    BEFORE UPDATE ON recipe_ratings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE recipe_ratings IS 'Stores user ratings for recipes (1-5 stars)';
COMMENT ON COLUMN recipe_ratings.id IS 'Primary key for the rating';
COMMENT ON COLUMN recipe_ratings.recipe_id IS 'Reference to the rated recipe';
COMMENT ON COLUMN recipe_ratings.user_id IS 'Reference to the user who rated';
COMMENT ON COLUMN recipe_ratings.rating IS 'Rating value from 1 to 5 stars';
COMMENT ON COLUMN recipe_ratings.created_at IS 'When the rating was created';
COMMENT ON COLUMN recipe_ratings.updated_at IS 'When the rating was last updated';
