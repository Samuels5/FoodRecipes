-- Create recipe_bookmarks table
CREATE TABLE recipe_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints (adjust table names if different)
    CONSTRAINT fk_recipe_bookmarks_recipe_id 
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_bookmarks_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate bookmarks
    CONSTRAINT recipe_bookmarks_user_id_recipe_id_key 
        UNIQUE (user_id, recipe_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_recipe_bookmarks_user_id ON recipe_bookmarks(user_id);
CREATE INDEX idx_recipe_bookmarks_recipe_id ON recipe_bookmarks(recipe_id);
CREATE INDEX idx_recipe_bookmarks_created_at ON recipe_bookmarks(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipe_bookmarks_updated_at 
    BEFORE UPDATE ON recipe_bookmarks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Add comments for documentation
COMMENT ON TABLE recipe_bookmarks IS 'Stores user bookmarks for recipes';
COMMENT ON COLUMN recipe_bookmarks.id IS 'Primary key for the bookmark';
COMMENT ON COLUMN recipe_bookmarks.recipe_id IS 'Reference to the bookmarked recipe';
COMMENT ON COLUMN recipe_bookmarks.user_id IS 'Reference to the user who bookmarked';
COMMENT ON COLUMN recipe_bookmarks.created_at IS 'When the bookmark was created';
COMMENT ON COLUMN recipe_bookmarks.updated_at IS 'When the bookmark was last updated';
