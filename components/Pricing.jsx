import { useState } from 'react'
import { PLANS, redirectToCheckout, openCustomerPortal } from '../stripe'
import { Check, Zap, Crown } from 'lucide-react'

export default function Pricing({ user, userData, onClose }) {
  const [loading, setLoading] = useState(null)

  async function handleSubscribe(plan) {
    if (!user) return
    if (plan.id === 'free') return

    setLoading(plan.id)
    try {
      await redirectToCheckout(plan.priceId, user.uid, user.email)
    } catch (err) {
      alert('Checkout failed: ' + err.message)
    } finally {
      setLoading(null)
    }
  }

  async function handleManage() {
    setLoading('portal')
    try {
      await openCustomerPortal(user.uid)
    } catch (err) {
      alert('Could not open portal: ' + err.message)
    } finally {
      setLoading(null)
    }
  }

  const currentPlan = userData?.plan || 'free'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl">×</button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Choose your plan</h2>
          <p className="text-slate-400 mt-2">Unlock unlimited deep reasoning and hard problem solving</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.values(PLANS).map(plan => {
            const isCurrent = currentPlan === plan.id
            const isPro = plan.id === 'pro'
            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-6 flex flex-col ${
                  isPro
                    ? 'border-sky-500 bg-sky-950/30 shadow-lg shadow-sky-900/20'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  {plan.id === 'unlimited' ? <Crown size={20} className="text-amber-400" /> :
                   plan.id === 'pro' ? <Zap size={20} className="text-sky-400" /> : null}
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                </div>

                <div className="mb-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-slate-400">/mo</span>}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg bg-slate-700 text-slate-300 font-medium cursor-default"
                  >
                    Current plan
                  </button>
                ) : plan.id === 'free' ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg border border-slate-600 text-slate-400"
                  >
                    Free forever
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={!!loading}
                    className={`w-full py-2.5 rounded-lg font-medium transition ${
                      isPro
                        ? 'bg-sky-600 hover:bg-sky-500 text-white'
                        : 'bg-slate-100 hover:bg-white text-slate-900'
                    } disabled:opacity-50`}
                  >
                    {loading === plan.id ? 'Redirecting...' : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {userData?.subscriptionStatus === 'active' && (
          <div className="mt-8 text-center">
            <button
              onClick={handleManage}
              disabled={loading === 'portal'}
              className="text-sky-400 hover:underline text-sm"
            >
              {loading === 'portal' ? 'Opening...' : 'Manage subscription & billing →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
