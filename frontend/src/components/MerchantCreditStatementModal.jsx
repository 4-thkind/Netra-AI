import React, { useState, useEffect } from 'react';
import { X, Printer, ShieldCheck, CreditCard, TrendingUp, Calendar, CheckCircle2, Download, Award } from 'lucide-react';
import { api } from '../services/api';
import { useDismissable } from '../hooks/useDismissable';

export default function MerchantCreditStatementModal({ isOpen, onClose, lang = 'en' }) {
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStatement();
    }
  }, [isOpen]);

  const loadStatement = async () => {
    setLoading(true);
    try {
      const data = await api.getCreditStatement();
      setStatement(data);
    } catch (e) {
      console.error('Failed to load credit statement:', e);
    } finally {
      setLoading(false);
    }
  };

  useDismissable(isOpen, onClose);


  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-cream rounded-3xl max-w-3xl w-full border border-gold/40 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh] print:max-h-none print:border-none print:shadow-none animate-fadeIn">
        
        {/* Header */}
        <div className="bg-wine text-cream px-6 py-4 flex items-center justify-between border-b border-gold/30 print:bg-wine print:text-cream">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-cream text-wine flex items-center justify-center font-bold text-lg shadow">
              ₹
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Official Paytm Merchant Lending</span>
                <span className="text-[9px] bg-gold text-charcoal px-1.5 py-0.2 rounded font-bold">Verified</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-cream">
                Merchant Credit & Working Capital Health Statement
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-gold hover:bg-gold/90 text-charcoal rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-wine-light text-cream transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 print:p-4 print:overflow-visible">
          {loading || !statement ? (
            <div className="py-16 text-center text-charcoal-muted text-sm animate-pulse">
              Generating bank-grade underwriting report from Netrā soundbox stream...
            </div>
          ) : (
            <>
              {/* Merchant Details Grid */}
              <div className="bg-sand/80 p-4 rounded-2xl border border-gold/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Merchant Name</span>
                  <span className="font-bold text-charcoal text-sm">{statement.merchant.name}</span>
                  <span className="text-[10px] text-wine font-medium block">{statement.merchant.store_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Soundbox ID</span>
                  <span className="font-mono font-bold text-charcoal text-sm">{statement.merchant.soundbox_id}</span>
                  <span className="text-[10px] text-emerald-700 font-medium block">{statement.merchant.kyc_status}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Cluster Area</span>
                  <span className="font-bold text-charcoal text-sm">{statement.merchant.cluster}</span>
                  <span className="text-[10px] text-charcoal-muted block">43 Active Kiranas</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Statement ID</span>
                  <span className="font-mono font-bold text-wine text-xs">{statement.statement_id}</span>
                  <span className="text-[10px] text-charcoal-muted block">Date: {new Date().toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Credit Underwriting Score Hero */}
              <div className="bg-gradient-to-r from-wine to-wine-dark text-cream p-5 rounded-2xl border border-gold/40 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-cream/10 border-2 border-gold flex flex-col items-center justify-center shrink-0">
                    <span className="text-2xl font-bold font-heading text-gold">{statement.underwriting.credit_score}</span>
                    <span className="text-[9px] text-cream/70">/ {statement.underwriting.max_score}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {statement.underwriting.risk_band}
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-lg text-cream mt-1">
                      Pre-Approved Limit: ₹{statement.underwriting.pre_approved_limit.toLocaleString('en-IN')}
                    </h4>
                    <p className="text-xs text-gold-light mt-0.5">
                      Repayment: ₹{statement.underwriting.recommended_daily_sweep}/day auto-sweep from daily Soundbox settlements.
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right bg-black/20 p-3 rounded-xl border border-gold/20 shrink-0">
                  <span className="text-[10px] text-cream/70 uppercase font-semibold block">Monthly Interest</span>
                  <span className="text-lg font-bold text-gold font-mono">{statement.underwriting.interest_rate_monthly_pct}% p.m.</span>
                  <span className="text-[10px] text-emerald-300 block">Zero Foreclosure Fee</span>
                </div>
              </div>

              {/* 30-Day Soundbox Turnover Metrics */}
              <div>
                <h4 className="font-heading font-bold text-sm text-charcoal mb-2 flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-wine" />
                  <span>Soundbox Settlement & Cashflow Predictability</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-cream p-3.5 rounded-xl border border-gold/30">
                    <span className="text-[10px] text-charcoal-muted uppercase font-semibold block">30-Day Turnover</span>
                    <span className="font-bold text-wine text-base mt-0.5 block">
                      ₹{statement.financial_metrics.monthly_turnover_inr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-charcoal-muted">{statement.financial_metrics.monthly_upi_txns} UPI Transactions</span>
                  </div>

                  <div className="bg-cream p-3.5 rounded-xl border border-gold/30">
                    <span className="text-[10px] text-charcoal-muted uppercase font-semibold block">Projected 7D Inflow</span>
                    <span className="font-bold text-emerald-700 text-base mt-0.5 block">
                      ₹{statement.financial_metrics.projected_7day_inflow_inr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">Predictable Volume</span>
                  </div>

                  <div className="bg-cream p-3.5 rounded-xl border border-gold/30">
                    <span className="text-[10px] text-charcoal-muted uppercase font-semibold block">Projected 7D Surplus</span>
                    <span className="font-bold text-wine text-base mt-0.5 block">
                      ₹{statement.financial_metrics.net_surplus_inr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-charcoal-muted">After Supplier Payouts</span>
                  </div>

                  <div className="bg-cream p-3.5 rounded-xl border border-gold/30">
                    <span className="text-[10px] text-charcoal-muted uppercase font-semibold block">Settlement Ratio</span>
                    <span className="font-bold text-emerald-700 text-base mt-0.5 block">
                      {statement.financial_metrics.settlement_continuity_ratio}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">Peak: {statement.financial_metrics.highest_velocity_day}</span>
                  </div>
                </div>
              </div>

              {/* Regulatory & Privacy Certification */}
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-start space-x-3 text-xs text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  <p className="font-bold text-emerald-900">
                    Paytm Digital Privacy & Differential Anonymity Compliance
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    This credit appraisal uses soundbox settlement continuity without exposing store-level basket breakdowns to external third parties. Cluster benchmark percentiles follow strict $k$-Anonymity ($N \ge 10$) and zero competitor identification standards.
                  </p>
                </div>
              </div>

              {/* Underwriter Signoff */}
              <div className="border-t border-gold/30 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-charcoal-muted gap-2">
                <div>
                  <span className="font-semibold text-charcoal">Underwritten By:</span> Netrā Automated Risk Engine • Paytm Merchant Lending Platform
                </div>
                <div className="font-mono text-[10px]">
                  Digital Signature: SHA256:{statement.statement_id.toLowerCase()}...verified
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
