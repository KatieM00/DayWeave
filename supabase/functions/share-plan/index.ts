import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SharePlanRequest {
  planId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { planId }: SharePlanRequest = await req.json()

    if (!planId) {
      throw new Error('Plan ID is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header is required')
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '')
    
    // Set the auth context for this request
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Invalid authentication token')
    }

    console.log('Generating shareable link for plan:', planId, 'by user:', user.id)

    // First, verify the plan exists and belongs to the user
    const { data: plan, error: fetchError } = await supabase
      .from('plans')
      .select('id, user_id, title, shareable_link_id, is_public')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching plan:', fetchError)
      throw new Error('Plan not found or access denied')
    }

    if (!plan) {
      throw new Error('Plan not found')
    }

    let shareableLinkId = plan.shareable_link_id

    // If the plan doesn't have a shareable link ID, generate one
    if (!shareableLinkId) {
      shareableLinkId = crypto.randomUUID()
      
      console.log('Generated new shareable link ID:', shareableLinkId)

      // Update the plan with the new shareable link ID and make it public
      const { error: updateError } = await supabase
        .from('plans')
        .update({ 
          shareable_link_id: shareableLinkId,
          is_public: true
        })
        .eq('id', planId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating plan with shareable link:', updateError)
        throw new Error('Failed to generate shareable link')
      }
    } else if (!plan.is_public) {
      // If shareable link exists but plan is not public, make it public
      const { error: updateError } = await supabase
        .from('plans')
        .update({ is_public: true })
        .eq('id', planId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error making plan public:', updateError)
        throw new Error('Failed to make plan shareable')
      }
    }

    // Construct the shareable URL
    // Get the origin from the request headers
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://your-app-domain.com'
    const shareableUrl = `${origin}/share/${shareableLinkId}`

    console.log('Successfully generated shareable link:', shareableUrl)

    return new Response(
      JSON.stringify({
        shareableUrl,
        shareableLinkId,
        planTitle: plan.title
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error generating shareable link:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate shareable link',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})