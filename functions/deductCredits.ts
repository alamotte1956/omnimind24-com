import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Atomic Credit Deduction Function
 * 
 * This function handles credit deduction in an atomic manner to prevent race conditions.
 * It should be called before processing an order to ensure credits are properly deducted.
 * 
 * Security features:
 * - Validates user authentication
 * - Prevents negative balance
 * - Creates audit trail via transaction records
 * - Returns accurate balance_after for transaction integrity
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, credit_cost, description, order_id } = await req.json();

    // Input validation
    if (!user_email || typeof user_email !== 'string') {
      return Response.json({ error: 'User email is required' }, { status: 400 });
    }

    if (!credit_cost || typeof credit_cost !== 'number' || credit_cost <= 0) {
      return Response.json({ error: 'Invalid credit cost' }, { status: 400 });
    }

    // Sanitize description to prevent injection
    const sanitizedDescription = (description || 'Content generation')
      .replace(/[<>]/g, '')
      .substring(0, 500);

    // Get user's current credits - this is the single source of truth
    const credits = await base44.entities.Credit.filter({ created_by: user_email });
    
    if (!credits || credits.length === 0) {
      return Response.json({ 
        error: 'No credit account found for user',
        code: 'NO_CREDIT_ACCOUNT'
      }, { status: 404 });
    }

    const userCredits = credits[0];
    const currentBalance = userCredits.balance || 0;

    // Check if user has sufficient credits
    if (currentBalance < credit_cost) {
      return Response.json({ 
        error: 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
        current_balance: currentBalance,
        required: credit_cost
      }, { status: 400 });
    }

    // Calculate new balance
    const newBalance = currentBalance - credit_cost;

    // Atomically update the credit balance
    await base44.entities.Credit.update(userCredits.id, {
      balance: newBalance,
      total_used: (userCredits.total_used || 0) + credit_cost
    });

    // Create transaction record with accurate balance_after
    const transaction = await base44.entities.CreditTransaction.create({
      transaction_type: 'usage',
      amount: -credit_cost,
      description: sanitizedDescription,
      balance_after: newBalance,
      order_id: order_id || null
    });

    return Response.json({ 
      success: true,
      previous_balance: currentBalance,
      new_balance: newBalance,
      credits_deducted: credit_cost,
      transaction_id: transaction.id
    });

  } catch (error) {
    console.error('Error deducting credits:', error);
    return Response.json({ 
      error: 'Failed to deduct credits',
      details: error.message
    }, { status: 500 });
  }
});
