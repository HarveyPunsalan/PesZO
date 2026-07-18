import { prisma } from '../config/database';
import { logger } from './logger';
import { parseUnlockCondition } from '../modules/quests/quests.service';

const ASSETS = [
  {
    name: 'Cola Coca Co.',
    ticker: 'COLA',
    type: 'stock',
    current_price: 150.00,
    trend_bias: 0.003,
    volatility: 0.020,
  },
  {
    name: 'NovaTech Industries',
    ticker: 'NOVA',
    type: 'stock',
    current_price: 280.00,
    trend_bias: 0.008,
    volatility: 0.055,
  },
  {
    name: 'Meridian Foods',
    ticker: 'MERI',
    type: 'stock',
    current_price: 95.00,
    trend_bias: 0.001,
    volatility: 0.018,
  },
  {
    name: 'Sovereign Bond Fund',
    ticker: 'SBF',
    type: 'bond',
    current_price: 100.00,
    trend_bias: 0.002,
    volatility: 0.004,
  },
  {
    name: 'PesoCoin',
    ticker: 'PESO',
    type: 'crypto',
    current_price: 5000.00,
    trend_bias: 0.000,
    volatility: 0.130,
  },
  {
    name: 'Cash',
    ticker: 'CASH',
    type: 'cash',
    current_price: 1.00,
    trend_bias: 0.000,
    volatility: 0.000,
  },
];

/**
 * Seed the 6 fake assets into the database.
 * Uses upsert so it is safe to run multiple times —
 * existing assets are left untouched, only missing ones are created.
 */
export const seedAssets = async (): Promise<void> => {
  for (const asset of ASSETS) {
    await prisma.asset.upsert({
      where: { ticker: asset.ticker },
      create: asset,
      update: {},
    });
  }

  logger.info('Assets seeded', { count: ASSETS.length });
};

// ---------------------------------------------------------------------------
// Quests
// ---------------------------------------------------------------------------

const QUESTS = [
  {
    title: 'Emergency Fund',
    description: 'Build a financial safety net before investing.',
    category: 'personal_finance',
    scenario_text: 'You just received your first paycheck. Your friend suggests putting everything into stocks, but another friend recommends building an emergency fund first. What approach do you take?',
    xp_reward: 50,
    unlock_condition: null,
    order_index: 1,
    choices: [
      {
        label: 'Keep it in a regular savings account',
        description: 'Park your money in a basic savings account where it earns minimal interest.',
        consequence: 'Your emergency fund barely keeps up with inflation, losing purchasing power over time. A high-yield account would have earned significantly more while remaining equally safe.',
        is_optimal: false,
      },
      {
        label: 'Build 3-6 months of expenses in a high-yield savings account',
        description: 'Set aside enough to cover 3-6 months of living expenses in a high-yield savings account.',
        consequence: 'This gives you a real safety net that earns meaningful interest while remaining liquid and low-risk. Financial experts universally recommend this as a first step.',
        is_optimal: true,
      },
      {
        label: 'Invest it all in stocks for higher returns',
        description: 'Put your entire paycheck into the stock market for maximum growth potential.',
        consequence: 'When an unexpected car repair hits two months later, you are forced to sell stocks at a loss to cover it. Without a buffer, market volatility becomes a direct threat to your livelihood.',
        is_optimal: false,
      },
    ],
  },
  {
    title: 'First Portfolio Allocation',
    description: 'Learn how to diversify your investments wisely.',
    category: 'investing',
    scenario_text: 'Your emergency fund is in place and you are ready to invest. You have 50,000 pesos to allocate. How do you build your first portfolio?',
    xp_reward: 100,
    unlock_condition: 'level:2',
    order_index: 2,
    choices: [
      {
        label: 'Put everything in a single tech stock',
        description: 'Concentrate your entire investment in one high-growth technology company.',
        consequence: 'When the tech sector corrects, your entire portfolio drops 35% in a single month. Concentration in one stock or sector magnifies both gains and catastrophic losses.',
        is_optimal: false,
      },
      {
        label: 'Split evenly between stocks, bonds, and cash',
        description: 'Divide your money equally across equities, bonds, and cash equivalents.',
        consequence: 'Your portfolio is stable but underperforms over the long term. Holding too much cash and bonds at a young age means missing out on the compound growth that equities provide over decades.',
        is_optimal: false,
      },
      {
        label: 'Use a diversified mix based on age and risk tolerance',
        description: 'Build a diversified portfolio using index funds across multiple asset classes, weighted by your time horizon.',
        consequence: 'Diversification across asset classes reduces your maximum drawdown while still capturing long-term market growth. Age-based allocation automatically shifts from aggressive to conservative as you approach retirement.',
        is_optimal: true,
      },
    ],
  },
  {
    title: 'Avalanche vs Snowball',
    description: 'Choose the best strategy for paying off debt.',
    category: 'debt_management',
    scenario_text: 'You have three debts: a credit card at 22% interest (20,000 pesos), a personal loan at 12% (15,000 pesos), and a student loan at 6% (30,000 pesos). You have an extra 5,000 pesos this month. Which debt do you target first?',
    xp_reward: 75,
    unlock_condition: null,
    order_index: 3,
    choices: [
      {
        label: 'Pay minimum on all debts equally',
        description: 'Spread your extra cash evenly across all three debts.',
        consequence: 'The credit card at 22% continues compounding aggressively while you chip away at the low-interest student loan. You end up paying thousands more in total interest over the life of your debts.',
        is_optimal: false,
      },
      {
        label: 'Snowball: pay off smallest balance first',
        description: 'Target the smallest debt first for psychological wins, regardless of interest rate.',
        consequence: 'You eliminate the personal loan quickly, which feels great, but the 22% credit card keeps growing. The snowball method trades mathematical optimality for motivational momentum.',
        is_optimal: false,
      },
      {
        label: 'Avalanche: pay off highest interest rate first',
        description: 'Target the highest interest rate debt first to minimize total interest paid.',
        consequence: 'By aggressively paying off the 22% credit card first, you save the most in total interest charges. The avalanche method is mathematically optimal, reducing the total cost of your debt by the largest amount.',
        is_optimal: true,
      },
    ],
  },
];

/**
 * Seed the quest content into the database.
 * Validates every unlock_condition format at startup using the
 * same parseUnlockCondition rule the service uses — a malformed
 * seed string crashes the process, never silently seeds bad data.
 */
export const seedQuests = async (): Promise<void> => {
  for (const quest of QUESTS) {
    parseUnlockCondition(quest.unlock_condition);

    await prisma.quest.upsert({
      where: { title: quest.title },
      create: {
        title: quest.title,
        description: quest.description,
        category: quest.category,
        scenario_text: quest.scenario_text,
        xp_reward: quest.xp_reward,
        unlock_condition: quest.unlock_condition,
        order_index: quest.order_index,
        choices: {
          create: quest.choices,
        },
      },
      update: {},
    });
  }

  logger.info('Quests seeded', { count: QUESTS.length });
};
