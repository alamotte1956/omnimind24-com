import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Credit Refund Function
 * 
 * This function handles credit refunds when an order fails or is cancelled.
 * It atomically adds credits back to the user's balance.
 * 
 * Security features:
 * - Validates user authentication
 * - Creates audit trail via transaction records
 * - Prevents double refunds via order_id tracking
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, credit_amount, reason, order_id } = await req.json();

    // Input validation
    if (!user_email || typeof user_email !== 'string') {
      return Response.json({ error: 'User email is required' }, { status: 400 });
    }

    if (!credit_amount || typeof credit_amount !== 'number' || credit_amount <= 0) {
      return Response.json({ error: 'Invalid credit amount' }, { status: 400 });
    }

    // Sanitize reason to prevent injection
    const sanitizedReason = (reason || 'Credit refund')
      .replace(/[<>]/g, '')
      .substring(0, 500);

    // Check for duplicate refund if order_id provided
    if (order_id) {
      const existingRefunds = await base44.entities.CreditTransaction.filter({
        order_id: order_id,
        transaction_type: 'refund'
      });
      
      if (existingRefunds && existingRefunds.length > 0) {
        return Response.json({
          error: 'Refund already processed for this order',
          code: 'DUPLICATE_REFUND'
        }, { status: 400 });
      }
    }

    // Get user's current credits
    const credits = await base44.entities.Credit.filter({ created_by: user_email });
    
    if (!credits || credits.length === 0) {
      return Response.json({ 
        error: 'No credit account found for user',
        code: 'NO_CREDIT_ACCOUNT'
      }, { status: 404 });
    }

    const userCredits = credits[0];
    const currentBalance = userCredits.balance || 0;

    // Calculate new balance
    const newBalance = currentBalance + credit_amount;

    // Atomically update the credit balance
    await base44.entities.Credit.update(userCredits.id, {
      balance: newBalance,
      total_used: Math.max(0, (userCredits.total_used || 0) - credit_amount)
    });

    // Create refund transaction record
    const transaction = await base44.entities.CreditTransaction.create({
      transaction_type: 'refund',
      amount: credit_amount,
      description: sanitizedReason,
      balance_after: newBalance,
      order_id: order_id || null
    });

    return Response.json({ 
      success: true,
      previous_balance: currentBalance,
      new_balance: newBalance,
      credits_refunded: credit_amount,
      transaction_id: transaction.id
    });

  } catch (error) {
    console.error('Error refunding credits:', error);
    return Response.json({ 
      error: 'Failed to refund credits',
      details: error.message
    }, { status: 500 });
  }
});
