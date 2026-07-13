import React from "react";
import RecommendationCard from "./widgets/RecommendationCard";
import RiskHeatmap from "./widgets/RiskHeatmap";
import BusinessQualityCard from "./widgets/BusinessQualityCard";
import FinancialSummaryTable from "./widgets/FinancialSummaryTable";
import KeyMetricsGrid from "./widgets/KeyMetricsGrid";
import GovernanceSummaryCard from "./widgets/GovernanceSummaryCard";
import ValuationSummaryCard from "./widgets/ValuationSummaryCard";
import TopOpportunitiesCard from "./widgets/TopOpportunitiesCard";

interface ExecutiveDashboardProps {
  result: any;
}

export default function ExecutiveDashboard({ result }: ExecutiveDashboardProps) {
  if (!result) return null;

  // Compute IPO Health Score (0-100)
  // Weights: Business 25%, Financial 30%, Risk 20%, Governance 15%, Valuation 10%
  const calculateHealthScore = () => {
    try {
      const bConf = result.business_analysis?.confidence_score || 0.5;
      const fConf = result.financial_analysis?.profitability?.confidence || 0.5;
      const rConf = 1.0; // Subtract penalty for high risks later
      const gConf = result.governance_analysis?.overall_governance?.confidence || 0.5;
      const vConf = result.valuation?.valuation_confidence?.confidence || 0.5;

      let score = (bConf * 25) + (fConf * 30) + (rConf * 20) + (gConf * 15) + (vConf * 10);
      
      // Apply risk penalty
      const criticalRisks = Object.values(result.risk_assessment || {})
        .flat()
        .filter((r: any) => r?.severity === 'CRITICAL').length;
      const highRisks = Object.values(result.risk_assessment || {})
        .flat()
        .filter((r: any) => r?.severity === 'HIGH').length;

      score -= (criticalRisks * 5) + (highRisks * 2);
      
      // Bonus for BUY recommendation
      const rec = result.valuation?.investment_recommendation?.value || "";
      if (rec.includes("STRONG BUY")) score += 10;
      else if (rec.includes("BUY")) score += 5;
      else if (rec.includes("SELL")) score -= 15;

      return Math.max(0, Math.min(100, score));
    } catch {
      return 50; // Fallback
    }
  };

  const healthScore = calculateHealthScore();

  // Extract Top 5 Risks
  const allRisks = Object.entries(result.risk_assessment || {}).flatMap(([cat, items]: [string, any]) => 
    (Array.isArray(items) ? items : []).map(item => ({ ...item, category: cat }))
  );

  // Extract Top 5 Opportunities
  const opportunities = [
    ...(result.business_analysis?.growth_drivers || []),
    ...(result.valuation?.key_catalysts?.value || []),
    ...(result.valuation?.bull_case?.value ? [result.valuation.bull_case.value] : [])
  ].slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <RecommendationCard 
            recommendation={result.valuation?.investment_recommendation?.value || "UNKNOWN"} 
            confidence={result.valuation?.investment_recommendation?.confidence || 0}
            healthScore={healthScore}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4">
          <KeyMetricsGrid metrics={{
            revenue: result.financial_analysis?.revenue_trend?.value || "N/A",
            profitMargin: result.financial_analysis?.net_margin?.value || "N/A",
            marketShare: result.business_analysis?.industry_position || "N/A",
            growth: result.financial_analysis?.revenue_growth?.value || "N/A",
            debtRatio: result.financial_analysis?.leverage?.value || "N/A",
            currentRatio: result.financial_analysis?.liquidity?.value || "N/A",
            quickRatio: result.financial_analysis?.working_capital?.value || "N/A",
          }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BusinessQualityCard 
          businessModel={result.business_analysis?.business_model || ""}
          competitiveAdvantage={result.business_analysis?.competitive_advantage || ""}
          industryPosition={result.business_analysis?.industry_position || ""}
          growthDrivers={result.business_analysis?.growth_drivers || []}
        />
        <TopOpportunitiesCard opportunities={opportunities} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FinancialSummaryTable metrics={{
            revenue: result.financial_analysis?.revenue_trend || {},
            netIncome: result.financial_analysis?.net_income || {},
            ebitda: result.financial_analysis?.ebitda || {},
            operatingMargin: result.financial_analysis?.operating_margin || {},
            cashFlow: result.financial_analysis?.cash_flow || {},
            debt: result.financial_analysis?.debt_structure || {},
            roe: result.financial_analysis?.profitability || {},
          }} />
        </div>
        <div className="lg:col-span-1">
          <RiskHeatmap risks={allRisks} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GovernanceSummaryCard metrics={{
          board: result.governance_analysis?.board_of_directors || {},
          commissioners: result.governance_analysis?.board_of_commissioners || {},
          auditCommittee: result.governance_analysis?.audit_committee || {},
          transparency: result.governance_analysis?.transparency_and_disclosure || {},
          compliance: result.governance_analysis?.regulatory_compliance || {},
          esg: result.governance_analysis?.esg_initiatives || {},
          overall: result.governance_analysis?.overall_governance || {},
        }} />
        <ValuationSummaryCard metrics={{
          fairValue: result.valuation?.fair_value || {},
          ipoPrice: result.valuation?.ipo_pricing_attractiveness || {},
          upside: result.valuation?.upside_potential || {},
          marginOfSafety: result.valuation?.margin_of_safety_discussion || {},
          expectedReturn: result.valuation?.corporate_governance || {}, // Fallback mapping 
          thesis: result.valuation?.investment_thesis || {},
        }} />
      </div>
    </div>
  );
}
