# XPShare Profile - Database Schema

[🏠 Zurück zum Index](./README.md) | [⬅️ Zurück zu Visual Hierarchy](./02-visual-hierarchy.md) | [➡️ Weiter zu API Routes](./04-api-routes.md)

---

## 📊 Database Tables

### user_category_stats ✅ IMPLEMENTED
```sql
CREATE TABLE user_category_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  experience_count INT NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2) NOT NULL,
  last_experience_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_top_category BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, category)
);

CREATE INDEX idx_user_category_user ON user_category_stats (user_id);
CREATE INDEX idx_user_category_percentage ON user_category_stats (user_id, percentage DESC);
```

**Purpose:** Pre-calculated category distribution for each user (XP DNA)

---

### user_similarity_cache ✅ IMPLEMENTED
```sql
CREATE TABLE user_similarity_cache (
  user_id UUID REFERENCES user_profiles(id),
  similar_user_id UUID REFERENCES user_profiles(id),
  similarity_score DECIMAL CHECK (similarity_score >= 0 AND similarity_score <= 1),
  shared_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  shared_category_count INT DEFAULT 0,
  same_location BOOLEAN DEFAULT FALSE,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, similar_user_id)
);

CREATE INDEX idx_similarity_score ON user_similarity_cache (user_id, similarity_score DESC);
```

**Purpose:** Pre-calculated similarity scores between users (refreshed periodically)

---

### user_pattern_contributions ✅ IMPLEMENTED
```sql
CREATE TABLE user_pattern_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  pattern_title TEXT NOT NULL,
  pattern_description TEXT,
  contribution_count INT DEFAULT 1,
  first_contribution_date TIMESTAMPTZ DEFAULT NOW(),
  last_contribution_date TIMESTAMPTZ DEFAULT NOW(),
  related_experience_ids TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pattern_contrib_user ON user_pattern_contributions (user_id);
```

**Purpose:** Tracks user's pattern discoveries and contributions

---

### user_connections ✅ IMPLEMENTED
```sql
CREATE TABLE user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id),
  addressee_id UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')) DEFAULT 'pending',
  message TEXT,
  similarity_score DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX idx_connections_requester ON user_connections (requester_id);
CREATE INDEX idx_connections_addressee ON user_connections (addressee_id);
```

**Purpose:** Manages connection requests between users (XP Twins)

---

### xp_dna_cache ✅ IMPLEMENTED
```sql
CREATE TABLE xp_dna_cache (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  category_distribution JSONB DEFAULT '{}'::JSONB,
  top_categories TEXT[] DEFAULT '{}'::TEXT[],
  total_experiences INT DEFAULT 0,
  experience_ids UUID[] DEFAULT '{}'::UUID[],
  category_vector JSONB DEFAULT '{}'::JSONB,
  location_centroid POINT,
  date_range DATERANGE,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Cached XP DNA data for fast similarity calculations

---

## 🔄 Functions

### calculate_similarity_score() ⚠️ NEEDS REVIEW

```sql
CREATE OR REPLACE FUNCTION calculate_similarity_score(user1_id UUID, user2_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  category_overlap DECIMAL(3,2);
  category_distribution DECIMAL(3,2);
  location_proximity DECIMAL(3,2);
  temporal_overlap DECIMAL(3,2);
  pattern_matches DECIMAL(3,2);
  experience_overlap DECIMAL(3,2);
BEGIN
  -- Weighted calculation (see full implementation in profil.md)
  RETURN (
    category_overlap * 0.25 +
    category_distribution * 0.20 +
    location_proximity * 0.15 +
    temporal_overlap * 0.10 +
    pattern_matches * 0.20 +
    experience_overlap * 0.10
  );
END;
$$ LANGUAGE plpgsql;
```

**Note:** Aktuelle Implementation in `user_similarity_cache` verwendet vereinfachten Algorithmus. Überprüfe ob alle 6 Faktoren berücksichtigt werden!

---

[🏠 Zurück zum Index](./README.md) | [⬅️ Zurück zu Visual Hierarchy](./02-visual-hierarchy.md) | [➡️ Weiter zu API Routes](./04-api-routes.md)
