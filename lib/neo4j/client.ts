import neo4j, { Driver, Session } from 'neo4j-driver'

let driver: Driver | null = null

/**
 * Get or create Neo4j driver instance (singleton)
 */
export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!)
    )
  }
  return driver
}

/**
 * Get a new session
 */
export function getSession(): Session {
  return getDriver().session()
}

/**
 * Close the driver connection
 */
export async function closeDriver() {
  if (driver) {
    await driver.close()
    driver = null
  }
}

/**
 * Create experience node in Neo4j
 */
export async function createExperienceNode(experienceId: string, category: string, userId: string) {
  const session = getSession()
  try {
    await session.run(
      `
      MERGE (e:Experience {id: $id})
      SET e.category = $category,
          e.created_at = datetime()
      WITH e
      MATCH (u:User {id: $userId})
      MERGE (u)-[:AUTHORED]->(e)
      RETURN e
      `,
      { id: experienceId, category, userId }
    )
  } finally {
    await session.close()
  }
}

/**
 * Create similarity relationship between experiences
 */
export async function createSimilarityRelationship(
  experienceId1: string,
  experienceId2: string,
  similarityScore: number
) {
  const session = getSession()
  try {
    await session.run(
      `
      MATCH (e1:Experience {id: $id1})
      MATCH (e2:Experience {id: $id2})
      MERGE (e1)-[r:SIMILAR_TO]->(e2)
      SET r.similarity_score = $score,
          r.created_at = datetime()
      RETURN r
      `,
      { id1: experienceId1, id2: experienceId2, score: similarityScore }
    )
  } finally {
    await session.close()
  }
}

/**
 * Find similar experiences using graph traversal
 */
export async function findSimilarExperiences(experienceId: string, limit: number = 10) {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (e:Experience {id: $id})-[r:SIMILAR_TO]->(similar:Experience)
      WHERE r.similarity_score > 0.7
      RETURN similar.id as id, r.similarity_score as score
      ORDER BY r.similarity_score DESC
      LIMIT $limit
      `,
      { id: experienceId, limit: neo4j.int(limit) }
    )

    return result.records.map((record) => ({
      id: record.get('id'),
      score: record.get('score'),
    }))
  } finally {
    await session.close()
  }
}

/**
 * Create user node
 */
export async function createUserNode(userId: string, username: string) {
  const session = getSession()
  try {
    await session.run(
      `
      MERGE (u:User {id: $id})
      SET u.username = $username,
          u.created_at = datetime()
      RETURN u
      `,
      { id: userId, username }
    )
  } finally {
    await session.close()
  }
}

/**
 * Initialize Neo4j schema (constraints and indexes)
 */
export async function initializeSchema() {
  const session = getSession()
  try {
    // Create constraints
    await session.run(
      'CREATE CONSTRAINT experience_id IF NOT EXISTS FOR (e:Experience) REQUIRE e.id IS UNIQUE'
    )
    await session.run(
      'CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE'
    )

    // Create indexes
    await session.run(
      'CREATE INDEX experience_category IF NOT EXISTS FOR (e:Experience) ON (e.category)'
    )
    await session.run(
      'CREATE INDEX user_username IF NOT EXISTS FOR (u:User) ON (u.username)'
    )

    console.log('✅ Neo4j schema initialized')
  } catch (error) {
    console.error('❌ Neo4j schema initialization failed:', error)
    throw error
  } finally {
    await session.close()
  }
}
