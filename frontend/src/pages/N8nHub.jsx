import React, { useState, useEffect } from 'react';
import { Workflow, Play, CheckCircle2, Download, ExternalLink, Sparkles, AlertTriangle, Layers, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function N8nHub({ lang = 'en' }) {
  const [n8nInfo, setN8nInfo] = useState(null);
  const [activeExecution, setActiveExecution] = useState(null);
  const [runningWf, setRunningWf] = useState(null);

  useEffect(() => {
    api.getN8nInfo().then(setN8nInfo).catch(console.error);
  }, []);

  const handleRunWorkflow = async (wfId) => {
    setRunningWf(wfId);
    setActiveExecution(null);
    try {
      let res;
      if (wfId === 'wf_daily_eod') res = await api.triggerN8nEod();
      else if (wfId === 'wf_festival_t14') res = await api.triggerN8nFestival();
      else if (wfId === 'wf_privacy_sentinel') res = await api.triggerN8nPrivacySentinel(4);

      setActiveExecution(res);
    } catch (e) {
      console.error(e);
    } finally {
      setRunningWf(null);
    }
  };

  const [copied, setCopied] = useState(null);

  // The old handler built an <a> it never clicked and then fired an alert(),
  // so nothing was ever exported. The workflow JSON is not served by Vite, so
  // copy the import path instead of pretending to download a file.
  const copyPath = async (fileName) => {
    const path = `n8n/workflows/${fileName}`;
    try {
      await navigator.clipboard.writeText(path);
    } catch {
      /* clipboard blocked (insecure origin / denied) - still show the path */
    }
    setCopied(fileName);
    setTimeout(() => setCopied((c) => (c === fileName ? null : c)), 2200);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-8 animate-fadeIn">
      
      {/* Official Voucher Banner */}
      <div className="bg-gradient-to-r from-wine to-wine-dark text-cream p-6 rounded-2xl border border-gold shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-gold text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>OFFICIAL HACKATHON SPONSOR TRACK</span>
          </div>
          <h2 className="font-heading font-bold text-lg sm:text-2xl text-cream mt-1 leading-snug">
            Best Use of n8n in Your Project • 1 Year Cloud Pro Prize
          </h2>
          <p className="text-sand text-xs mt-1 max-w-2xl leading-relaxed">
            Netrā orchestrates all asynchronous merchant events via n8n: 10 PM EOD cash-flow forecasting, Sarvam AI Soundbox voice delivery, and autonomous festival inventory tenders.
          </p>
        </div>

        <div className="bg-cream/10 p-3.5 rounded-xl border border-gold/30 shrink-0 text-center sm:text-right">
          <span className="text-[10px] text-gold-light uppercase font-semibold">n8n Cloud Voucher Code</span>
          <div className="font-mono font-bold text-sm text-gold bg-wine-dark/80 px-3 py-1 rounded mt-1 select-all border border-gold/40">
            2026-COMMUNITY-HACKATHON-INDIA-18D35A55
          </div>
          <a
            href="https://n8n.notion.site/voucher-code"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-cream/90 hover:text-gold flex items-center justify-end space-x-1 mt-1 font-medium"
          >
            <span>Redeem 1-Month Cloud Access</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 3 Core Production Workflows */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-xl text-charcoal flex items-center space-x-2">
          <Workflow className="w-5 h-5 text-wine" />
          <span>Autonomous n8n Production Workflows</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(n8nInfo?.workflows || []).map((wf) => (
            <div key={wf.id} className="bg-cream rounded-2xl p-5 border border-gold/30 shadow-subtle flex flex-col justify-between hover:border-gold transition-colors">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-gold/20">
                  <span className="text-xs font-semibold uppercase tracking-wider text-wine bg-wine/10 px-2.5 py-0.5 rounded-full border border-wine/20">
                    {wf.category}
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>

                <h4 className="font-heading font-semibold text-base text-charcoal mt-3">{wf.name}</h4>
                <p className="text-xs text-charcoal-muted mt-1 leading-snug">{wf.description}</p>

                {/* Node Sequence */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-muted">Execution Chain:</span>
                  <div className="space-y-1">
                    {wf.nodes.map((n, i) => (
                      <div key={i} className="flex items-center space-x-2 text-[11px] text-charcoal bg-sand/60 px-2.5 py-1.5 rounded-lg border border-gold/20 font-medium">
                        <span className="text-[9px] font-bold text-wine w-3">{i+1}.</span>
                        <span className="truncate">{n.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gold/20 space-y-2">
                <button
                  onClick={() => handleRunWorkflow(wf.id)}
                  disabled={runningWf === wf.id}
                  className="w-full h-11 rounded-xl bg-wine hover:bg-wine-dark disabled:opacity-60
                             disabled:cursor-default text-cream text-sm font-semibold flex items-center
                             justify-center gap-2 shadow-subtle transition-colors"
                >
                  <Play className={`w-3.5 h-3.5 text-gold ${runningWf === wf.id ? 'animate-spin' : ''}`} />
                  <span>{runningWf === wf.id ? 'Executing n8n Pipeline...' : 'Test Run Live Workflow'}</span>
                </button>

                <button
                  onClick={() => copyPath(wf.file)}
                  className="w-full h-10 rounded-xl bg-sand hover:bg-gold/20 text-charcoal text-xs
                             font-semibold border border-gold/30 flex items-center justify-center
                             gap-1.5 transition-colors"
                >
                  {copied === wf.file ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Path copied</span></>
                  ) : (
                    <><Download className="w-3.5 h-3.5 text-wine" /><span>Copy import path</span></>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Execution Trace Viewer */}
      {activeExecution && (
        <div className="bg-cream rounded-2xl p-6 border border-gold/40 shadow-lift animate-riseIn space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gold/30">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="font-heading font-semibold text-base text-charcoal">
                n8n Live Execution Trace: <span className="text-wine font-mono text-xs">{activeExecution.execution_id}</span>
              </h4>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              STATUS: {activeExecution.status}
            </span>
          </div>

          <p className="text-xs text-charcoal font-medium bg-sand/80 p-3 rounded-xl border border-gold/20">
            {activeExecution.summary}
          </p>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal">Step-by-Step Node Data Flow:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeExecution.steps_executed.map((step, idx) => (
                <div key={idx} className="bg-sand/60 p-3 rounded-xl border border-gold/20">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-wine">
                    <span>Node {idx+1}:</span>
                    <span className="truncate">{step.node}</span>
                  </div>
                  <pre className="mt-1.5 text-[10px] bg-cream p-2 rounded border border-gold/30 font-mono text-charcoal-muted max-h-32 overflow-y-auto">
                    {JSON.stringify(step.output, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
