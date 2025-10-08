import { useMemo } from 'react';
import { useRewardsConfig } from './useRewardsConfig';

/**
 * Centralized hook for all rewards calculations and display logic
 * Ensures consistency across all components and real-time sync with admin config
 */
export const useRewardsCalculation = () => {
  const { config, loading } = useRewardsConfig();

  const calculations = useMemo(() => {
    if (!config) {
      // Default fallback values
      return {
        loading: true,
        earningPercentage: 1,
        maxUsagePercentage: 2,
        pointsPerDollar: 1000,
        minPointsToUse: 1000,
        showPercentage: false,
        showConversion: false,
        calculateEarningPoints: (amount: number) => Math.floor(amount * 10),
        getMaxUsablePoints: (purchaseAmount: number, availablePoints: number) => {
          const maxDollars = purchaseAmount * 0.02;
          const maxPoints = Math.floor(maxDollars * 1000);
          return Math.min(maxPoints, availablePoints);
        },
        pointsToDollars: (points: number) => points / 1000,
        dollarsToPoints: (dollars: number) => Math.floor(dollars * 1000),
        formatEarningDisplay: (points: number) => `+${points.toLocaleString()} pts`,
        formatUsageDisplay: (maxPoints: number, percentage?: number) => 
          `Máximo: ${maxPoints.toLocaleString()} pts${percentage ? ` (${percentage}%)` : ''}`,
        getEarningDescription: () => 'Puntos de recompensa',
      };
    }

    const earningPercentage = Number(config.earning_percentage) || 1;
    const maxUsagePercentage = Number(config.max_usage_percentage) || 2;
    const pointsPerDollar = Number(config.points_per_dollar) || 1000;
    const minPointsToUse = config.min_points_to_use || 1000;
    const showPercentage = config.show_percentage_to_users;
    const showConversion = config.show_conversion_rate;

    /**
     * Calculate points earned from a purchase
     * Based on earning_percentage and points_per_dollar from config
     */
    const calculateEarningPoints = (amount: number): number => {
      // Convert percentage to decimal (1% = 0.01)
      const percentageDecimal = earningPercentage / 100;
      // Calculate dollar amount earned
      const dollarsEarned = amount * percentageDecimal;
      // Convert to points
      return Math.floor(dollarsEarned * pointsPerDollar);
    };

    /**
     * Calculate maximum points that can be used on a purchase
     * Based on max_usage_percentage from config
     */
    const getMaxUsablePoints = (purchaseAmount: number, availablePoints: number): number => {
      const percentageDecimal = maxUsagePercentage / 100;
      const maxDollars = purchaseAmount * percentageDecimal;
      const maxPoints = Math.floor(maxDollars * pointsPerDollar);
      return Math.min(maxPoints, availablePoints);
    };

    /**
     * Convert points to dollars
     */
    const pointsToDollars = (points: number): number => {
      return points / pointsPerDollar;
    };

    /**
     * Convert dollars to points
     */
    const dollarsToPoints = (dollars: number): number => {
      return Math.floor(dollars * pointsPerDollar);
    };

    /**
     * Format earning display based on visibility settings
     */
    const formatEarningDisplay = (points: number): string => {
      if (showPercentage) {
        return `+${points.toLocaleString()} pts (${earningPercentage}%)`;
      }
      return `+${points.toLocaleString()} pts`;
    };

    /**
     * Format usage display based on visibility settings
     */
    const formatUsageDisplay = (maxPoints: number, percentage?: number): string => {
      const displayPercentage = percentage ?? maxUsagePercentage;
      if (showPercentage) {
        return `Máximo: ${maxPoints.toLocaleString()} pts (${displayPercentage}%)`;
      }
      return `Máximo: ${maxPoints.toLocaleString()} pts`;
    };

    /**
     * Get earning description for display
     */
    const getEarningDescription = (): string => {
      if (showPercentage && showConversion) {
        return `${earningPercentage}% en puntos de recompensa (${pointsPerDollar} pts = $1)`;
      }
      if (showPercentage) {
        return `${earningPercentage}% en puntos de recompensa`;
      }
      if (showConversion) {
        return `Puntos de recompensa (${pointsPerDollar} pts = $1)`;
      }
      return 'Puntos de recompensa';
    };

    return {
      loading: false,
      earningPercentage,
      maxUsagePercentage,
      pointsPerDollar,
      minPointsToUse,
      showPercentage,
      showConversion,
      calculateEarningPoints,
      getMaxUsablePoints,
      pointsToDollars,
      dollarsToPoints,
      formatEarningDisplay,
      formatUsageDisplay,
      getEarningDescription,
    };
  }, [config, loading]);

  return calculations;
};
