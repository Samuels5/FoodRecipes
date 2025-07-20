-- Create recipe_purchases table
CREATE TABLE recipe_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL,
    buyer_id UUID NOT NULL,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    chapa_tx_ref VARCHAR(255) UNIQUE,
    chapa_response_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_recipe_purchases_recipe_id 
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_purchases_buyer_id 
        FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate purchases
    CONSTRAINT recipe_purchases_buyer_recipe_unique 
        UNIQUE (buyer_id, recipe_id)
);

-- Create recipe_pricing table (recipes can have different pricing)
CREATE TABLE recipe_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) DEFAULT 'ETB',
    is_free BOOLEAN DEFAULT FALSE,
    discount_percentage DECIMAL(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_recipe_pricing_recipe_id 
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    
    -- Unique constraint - one pricing per recipe
    CONSTRAINT recipe_pricing_recipe_unique 
        UNIQUE (recipe_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_recipe_purchases_recipe_id ON recipe_purchases(recipe_id);
CREATE INDEX idx_recipe_purchases_buyer_id ON recipe_purchases(buyer_id);
CREATE INDEX idx_recipe_purchases_payment_status ON recipe_purchases(payment_status);
CREATE INDEX idx_recipe_purchases_transaction_id ON recipe_purchases(transaction_id);
CREATE INDEX idx_recipe_purchases_created_at ON recipe_purchases(created_at DESC);

CREATE INDEX idx_recipe_pricing_recipe_id ON recipe_pricing(recipe_id);
CREATE INDEX idx_recipe_pricing_price ON recipe_pricing(price);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipe_purchases_updated_at 
    BEFORE UPDATE ON recipe_purchases 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_pricing_updated_at 
    BEFORE UPDATE ON recipe_pricing 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE recipe_purchases IS 'Stores payment transactions for recipe purchases';
COMMENT ON COLUMN recipe_purchases.id IS 'Primary key for the purchase';
COMMENT ON COLUMN recipe_purchases.recipe_id IS 'Reference to the purchased recipe';
COMMENT ON COLUMN recipe_purchases.buyer_id IS 'Reference to the user who bought the recipe';
COMMENT ON COLUMN recipe_purchases.transaction_id IS 'Unique transaction identifier';
COMMENT ON COLUMN recipe_purchases.amount IS 'Amount paid for the recipe';
COMMENT ON COLUMN recipe_purchases.payment_status IS 'Status of the payment (pending, completed, failed, refunded)';
COMMENT ON COLUMN recipe_purchases.chapa_tx_ref IS 'Chapa transaction reference';
COMMENT ON COLUMN recipe_purchases.chapa_response_data IS 'Full response data from Chapa API';

COMMENT ON TABLE recipe_pricing IS 'Stores pricing information for recipes';
COMMENT ON COLUMN recipe_pricing.price IS 'Price of the recipe';
COMMENT ON COLUMN recipe_pricing.is_free IS 'Whether the recipe is free or paid';
COMMENT ON COLUMN recipe_pricing.discount_percentage IS 'Discount percentage if any';
