import { supabase } from '../lib/supabase';

export const trackBudget = async (category: string, amount: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('budget_tracking').insert({
      user_id: user.id,
      category,
      amount
    });
  } catch (error) {
    console.error('Error tracking budget:', error);
    throw error;
  }
};

export const getBudgetSummary = async (startDate: Date, endDate: Date) => {
  try {
    const { data, error } = await supabase
      .from('budget_tracking')
      .select('category, amount, date')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());

    if (error) throw error;

    return data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);
  } catch (error) {
    console.error('Error getting budget summary:', error);
    throw error;
  }
};