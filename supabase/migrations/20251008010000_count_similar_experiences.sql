-- Function to count similar experiences based on embedding similarity
CREATE OR REPLACE FUNCTION count_similar_experiences(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.75,
  max_results int DEFAULT 50
)
RETURNS TABLE (count bigint)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)
  FROM experiences
  WHERE
    embedding IS NOT NULL
    AND visibility IN ('public', 'anonymous')
    AND (1 - (embedding <=> query_embedding)) >= similarity_threshold
  LIMIT max_results;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION count_similar_experiences TO authenticated, anon;

-- Comment
COMMENT ON FUNCTION count_similar_experiences IS 'Count similar experiences based on embedding similarity for live analysis';
