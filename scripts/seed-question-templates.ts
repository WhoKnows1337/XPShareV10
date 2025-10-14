#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface QuestionOption {
  label: string
  value: string
  min?: number
  max?: number
  step?: number
  default?: number
}

interface QuestionTemplate {
  question_text: string
  question_type: string
  priority: number
  is_optional: boolean
  maps_to_attribute?: string
  options?: QuestionOption[]
  help_text?: string
  placeholder?: string
}

interface CategoryTemplate {
  category_name: string
  questions: QuestionTemplate[]
}

interface TemplateData {
  [categorySlug: string]: CategoryTemplate
}

async function seedQuestionTemplates() {
  console.log('🌱 Starting Question Templates Seed...\n')

  // Load template data
  const templatePath = path.join(process.cwd(), 'data', 'question-templates.json')
  const templateData: TemplateData = JSON.parse(fs.readFileSync(templatePath, 'utf-8'))

  console.log(`📄 Loaded templates for ${Object.keys(templateData).length} categories\n`)

  let totalInserted = 0
  let totalSkipped = 0

  for (const [categorySlug, template] of Object.entries(templateData)) {
    console.log(`\n📂 Processing: ${template.category_name} (${categorySlug})`)

    // Find category
    const { data: category, error: categoryError } = await supabase
      .from('question_categories')
      .select('id, name')
      .eq('slug', categorySlug)
      .single()

    if (categoryError || !category) {
      console.log(`   ⚠️  Category not found, skipping...`)
      continue
    }

    console.log(`   ✓ Found category: ${category.name}`)

    // Check if questions already exist
    const { data: existingQuestions } = await supabase
      .from('dynamic_questions')
      .select('id')
      .eq('category_id', category.id)

    if (existingQuestions && existingQuestions.length > 0) {
      console.log(`   ⏭️  Category already has ${existingQuestions.length} questions, skipping...`)
      totalSkipped += template.questions.length
      continue
    }

    // Insert questions
    let inserted = 0
    for (const question of template.questions) {
      const questionData = {
        category_id: category.id,
        question_text: question.question_text,
        question_type: question.question_type,
        priority: question.priority,
        is_optional: question.is_optional,
        maps_to_attribute: question.maps_to_attribute || null,
        options: question.options || [],
        help_text: question.help_text || null,
        placeholder: question.placeholder || null,
        is_active: true,
      }

      const { error: insertError } = await supabase
        .from('dynamic_questions')
        .insert(questionData)

      if (insertError) {
        console.log(`   ❌ Error inserting question: ${question.question_text}`)
        console.log(`      ${insertError.message}`)
      } else {
        inserted++
      }
    }

    console.log(`   ✅ Inserted ${inserted}/${template.questions.length} questions`)
    totalInserted += inserted
  }

  console.log('\n' + '='.repeat(60))
  console.log(`\n✅ Seed completed!`)
  console.log(`   📊 Total inserted: ${totalInserted}`)
  console.log(`   ⏭️  Total skipped: ${totalSkipped}`)
  console.log('\n' + '='.repeat(60) + '\n')
}

// Run the seed
seedQuestionTemplates()
  .then(() => {
    console.log('✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
