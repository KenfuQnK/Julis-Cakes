CREATE TABLE IF NOT EXISTS recipes (
  id VARCHAR(100) PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_uri TEXT,
  total_time_minutes INTEGER CHECK (total_time_minutes IS NULL OR total_time_minutes > 0),
  servings INTEGER CHECK (servings IS NULL OR servings > 0),
  category VARCHAR(30) CHECK (category IN ('desserts', 'healthy', 'quick', 'airFryer')),
  is_user_created BOOLEAN NOT NULL DEFAULT FALSE,
  created_by_scope VARCHAR(160) NOT NULL DEFAULT 'seed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id VARCHAR(140) PRIMARY KEY,
  recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount TEXT NOT NULL,
  image_uri TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_steps (
  id VARCHAR(140) PRIMARY KEY,
  recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT NOT NULL,
  image_uri TEXT,
  step_number INTEGER NOT NULL CHECK (step_number > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_images (
  id VARCHAR(160) PRIMARY KEY,
  recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  image_uri TEXT NOT NULL,
  image_kind VARCHAR(30) NOT NULL DEFAULT 'cover',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_lists (
  id VARCHAR(180) PRIMARY KEY,
  scope_key VARCHAR(160) NOT NULL,
  name VARCHAR(120) NOT NULL,
  list_type VARCHAR(30) NOT NULL CHECK (list_type IN ('created', 'favorites', 'custom')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (scope_key, list_type)
);

CREATE TABLE IF NOT EXISTS recipe_list_items (
  list_id VARCHAR(180) NOT NULL REFERENCES recipe_lists(id) ON DELETE CASCADE,
  recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (list_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS recipe_favorites (
  scope_key VARCHAR(160) NOT NULL,
  recipe_id VARCHAR(100) NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (scope_key, recipe_id)
);

CREATE INDEX IF NOT EXISTS recipes_updated_at_idx ON recipes (updated_at DESC);
CREATE INDEX IF NOT EXISTS recipes_category_idx ON recipes (category);
CREATE INDEX IF NOT EXISTS recipe_ingredients_recipe_idx ON recipe_ingredients (recipe_id, sort_order);
CREATE INDEX IF NOT EXISTS recipe_steps_recipe_idx ON recipe_steps (recipe_id, step_number);
CREATE INDEX IF NOT EXISTS recipe_images_recipe_idx ON recipe_images (recipe_id, sort_order);
CREATE INDEX IF NOT EXISTS recipe_lists_scope_idx ON recipe_lists (scope_key, updated_at DESC);
CREATE INDEX IF NOT EXISTS recipe_favorites_scope_idx ON recipe_favorites (scope_key, created_at DESC);
