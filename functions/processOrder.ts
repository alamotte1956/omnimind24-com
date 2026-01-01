import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { order_id } = await req.json();

    // Get the order
    const orders = await base44.entities.ContentOrder.filter({ id: order_id });
    if (!orders || orders.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // Build COSTAR-enhanced prompt
    let enhancedPrompt = order.input_data;

    if (order.costar_context || order.costar_objective || order.costar_style || 
        order.costar_tone || order.costar_audience || order.costar_response_format) {
      
      enhancedPrompt = `
# Content Generation Request

## User Input
${order.input_data}

## COSTAR Framework Parameters
${order.costar_context ? `\n**Context**: ${order.costar_context}` : ''}
${order.costar_objective ? `\n**Objective**: ${order.costar_objective}` : ''}
${order.costar_style ? `\n**Style**: ${order.costar_style}` : ''}
${order.costar_tone ? `\n**Tone**: ${order.costar_tone}` : ''}
${order.costar_audience ? `\n**Audience**: ${order.costar_audience}` : ''}
${order.costar_response_format ? `\n**Response Format**: ${order.costar_response_format}` : ''}

## Instructions
Generate content that strictly adheres to the COSTAR parameters above. The context, objective, style, tone, audience, and response format MUST significantly influence your output. Deliver exactly what is requested with the specified characteristics.
`;
    }

    // Call AI with enhanced prompt
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: enhancedPrompt,
      add_context_from_internet: false
    });

    // Update order with result
    await base44.entities.ContentOrder.update(order_id, {
      output_content: typeof result === 'string' ? result : result.response || JSON.stringify(result),
      status: 'completed',
      model_used: 'gpt-4o-mini'
    });

    return Response.json({ 
      success: true, 
      message: 'Content generated successfully',
      used_costar: !!(order.costar_context || order.costar_objective || order.costar_style || 
                       order.costar_tone || order.costar_audience || order.costar_response_format)
    });

  } catch (error) {
    console.error('Error processing order:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});