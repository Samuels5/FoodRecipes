-- Create recipe_comments table
CREATE TABLE recipe_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL,
    user_id UUID NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_recipe_comments_recipe_id 
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_comments_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_recipe_comments_recipe_id ON recipe_comments(recipe_id);
CREATE INDEX idx_recipe_comments_user_id ON recipe_comments(user_id);
CREATE INDEX idx_recipe_comments_created_at ON recipe_comments(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipe_comments_updated_at 
    BEFORE UPDATE ON recipe_comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE recipe_comments IS 'Stores user comments on recipes';
COMMENT ON COLUMN recipe_comments.id IS 'Primary key for the comment';
COMMENT ON COLUMN recipe_comments.recipe_id IS 'Reference to the commented recipe';
COMMENT ON COLUMN recipe_comments.user_id IS 'Reference to the user who commented';
COMMENT ON COLUMN recipe_comments.comment_text IS 'The actual comment text';
COMMENT ON COLUMN recipe_comments.created_at IS 'When the comment was created';
COMMENT ON COLUMN recipe_comments.updated_at IS 'When the comment was last updated';
