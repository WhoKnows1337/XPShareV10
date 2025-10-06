/**
 * Initialize Neo4j database schema
 * Run this once to set up constraints and indexes
 */

import 'dotenv/config'
import { initializeSchema, getDriver, closeDriver } from './client'

async function main() {
  console.log('🔄 Initializing Neo4j schema...')

  try {
    // Test connection
    const driver = getDriver()
    await driver.verifyConnectivity()
    console.log('✅ Neo4j connection successful')

    // Initialize schema
    await initializeSchema()

    console.log('🎉 Neo4j initialization complete!')
  } catch (error) {
    console.error('❌ Neo4j initialization failed:', error)
    process.exit(1)
  } finally {
    await closeDriver()
  }
}

main()
