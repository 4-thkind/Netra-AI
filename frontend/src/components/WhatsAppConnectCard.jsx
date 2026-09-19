import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Loader2, Pencil, Workflow,
         AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter, Pill } from './ui/Card';
import { api } from '../services/api';

/**
 * Connect a real phone number and receive Netrā alerts on WhatsApp.
 *
 * Delivery goes Netrā -> n8n webhook -> WhatsApp provider, so this card never
 * talks to WhatsApp itself. When no n8n webhook is configured the dispatch is
 * reported as SIMULATED with the exact envelope, rather than silently doing
 * nothing.
 */
export default function WhatsAppConnectCard({ merchant, onRefreshMerchant }) {
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('idle');   // idle | saving | sending | sent
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPhone(merchant?.whatsapp_number || merchant?.phone || '');
  }, [merchant]);

  useEffect(() => {
    api.getDeliveries().then((d) => setMode(d.mode)).catch(() => {});
  }, []);

  const save = async () => {
    setState('saving'); setError(null);
    try {
      const res = await api.updateContact(phone);
      setPhone(res.whatsapp_number);
      // Re-read the real mode rather than inferring it from one string.
      api.getDeliveries().then((d) => setMode(d.mode)).catch(() => {});
      setEditing(false);
      onRefreshMerchant?.();
    } catch (e) {
      setError('Enter a valid number, e.g. +91 98765 43210');
    } finally {
      setState('idle');
    }
  };

  const send = async () => {
    setState('sending'); setError(null); setResult(null);
    try {
      const res = await api.sendWhatsApp('insight');
      setResult(res);
      setState('sent');
      setTimeout(() => setState('idle'), 4000);
    } catch (e) {
      setError('Dispatch failed. Check the backend logs.');
      setState('idle');
    }
  };

  return (
    <Card>
      <CardHeader
        Icon={MessageSquare}
        tone="emerald"
        title="WhatsApp Connect"
        subtitle="n8n orchestration, WhatsApp Cloud API delivery"
        badge={
          <Pill tone={mode === 'live' || mode === 'cloud_api' ? 'emerald' : 'gold'}>
            {mode === 'cloud_api' ? 'WhatsApp live'
              : mode === 'live' ? 'n8n live' : 'not configured'}
          </Pill>
        }
      />

      <CardBody className="space-y-3">
        <div className="rounded-xl bg-sand/70 border border-gold/20 p-3">
          <p className="text-[10px] uppercase font-bold tracking-wide text-wine">
            Merchant WhatsApp number
          </p>

          {editing ? (
            <div className="mt-2 flex gap-2">
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && save()}
                placeholder="+91 98765 43210"
                /* 16px on mobile stops iOS Safari zooming on focus */
                className="flex-1 min-w-0 h-10 px-3 rounded-xl bg-cream border border-gold/40
                           text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-wine/40"
              />
              <button
                onClick={save}
                disabled={state === 'saving'}
                className="h-10 px-4 rounded-xl bg-wine hover:bg-wine-dark text-cream text-xs
                           font-bold shrink-0 disabled:opacity-60 transition-colors"
              >
                {state === 'saving' ? '…' : 'Save'}
              </button>
            </div>
          ) : (
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="font-heading font-bold text-base text-charcoal tabular-nums truncate">
                {phone || 'Not set'}
              </span>
              <button
                onClick={() => setEditing(true)}
                className="text-wine text-xs font-semibold inline-flex items-center gap-1
                           hover:underline underline-offset-2 shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
                Change
              </button>
            </div>
          )}

          <p className="text-[11px] text-charcoal-muted mt-2 leading-snug">
            Put your own number in and the next alert arrives on your phone.
          </p>
        </div>

        {error && (
          <p className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200
                        rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={send}
          disabled={state === 'sending' || !phone}
          className={`w-full h-11 rounded-xl text-xs font-bold flex items-center justify-center
                      gap-2 border transition-colors disabled:opacity-60 ${
            state === 'sent' && result?.status === 'SENT'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : state === 'sent'
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
          }`}
        >
          {state === 'sending' && (<><Loader2 className="w-4 h-4 animate-spin" />Sending…</>)}
          {/* Never claim delivery the backend did not confirm: SIMULATED means
              the envelope was built but no n8n/provider actually sent it. */}
          {state === 'sent' && result?.status === 'SENT' && (
            <><CheckCircle2 className="w-4 h-4" />Delivered to {result.to}</>
          )}
          {state === 'sent' && result?.status !== 'SENT' && (
            <><AlertTriangle className="w-4 h-4" />Queued — tap below to deliver</>
          )}
          {state !== 'sending' && state !== 'sent' && (<><Send className="w-4 h-4" />Send me a growth alert</>)}
        </button>

        {/* When nothing can actually deliver, hand the merchant a link that
            opens WhatsApp with the message pre-filled. Same text, real chat. */}
        {/* Meta returns numeric codes; the backend attaches a human hint. */}
        {result?.hint && (
          <p className="text-[11px] font-semibold text-amber-900 bg-amber-50 border
                        border-amber-300 rounded-xl px-3 py-2 leading-snug">
            {result.hint}
          </p>
        )}

        {result && result.status !== 'SENT' && (
          <a
            href={`https://wa.me/${String(result.to || '').replace(/\D/g, '')}?text=${encodeURIComponent(result.body || '')}`}
            target="_blank"
            rel="noreferrer"
            className="w-full h-11 rounded-xl bg-wine hover:bg-wine-dark text-cream text-xs font-bold
                       flex items-center justify-center gap-2 border border-gold/30 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-gold" />
            Send it on WhatsApp now
          </a>
        )}

        {result && (
          <div className="rounded-xl bg-charcoal text-cream p-3 text-[11px] font-mono
                          overflow-x-auto animate-riseIn">
            <div className="flex items-center gap-2 mb-1.5 font-sans font-bold text-gold">
              <Workflow className="w-3.5 h-3.5" />
              <span>{result.status === 'SENT'
                ? `Delivered via ${result.delivery === 'whatsapp_cloud_api' ? 'WhatsApp Cloud API' : 'n8n'}`
                : 'Envelope built (not delivered)'}</span>
            </div>
            <div>to: {result.to}</div>
            <div>template: {result.template}</div>
            <div>status: {result.status}</div>
            <div className="whitespace-pre-wrap mt-1.5 text-sand">{result.body}</div>
          </div>
        )}
      </CardBody>

      <CardFooter
        note={
          mode === 'live'
            ? 'Live: n8n is dispatching to WhatsApp'
            : 'Set N8N_WEBHOOK_URL to dispatch for real'
        }
      />
    </Card>
  );
}
