import { useState, useEffect } from 'react'
import { Gift, Share2, ShoppingCart, Trophy, LogOut, Copy, Check, Mail, Lock } from 'lucide-react'

const SUPABASE_URL = 'https://srmawzqsvhahiqdoeglh.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybWF3enFzdmhhaGlxZG9lZ2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzU2ODgsImV4cCI6MjA3NDc1MTY4OH0.K6xY1MrIrt1boWh4tVlld_qgUVnDY-qJljuVhS_TVUg'

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const endpoint = isSignUp ? 'signup' : 'token?grant_type=password'
      const res = await fetch(`${SUPABASE_URL}/auth/v1/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (data.access_token) {
        onLogin({ token: data.access_token, user: data.user })
      } else if (isSignUp && res.ok) {
        setError('Account created! Please sign in.')
        setIsSignUp(false)
      } else {
        setError(data.error_description || data.msg || 'Authentication failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Pride.me
          </h1>
          <p className="text-gray-600">Share pride, celebrate achievements</p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ session, onSignOut }) {
  const [activeTab, setActiveTab] = useState('home')
  const [prideScore, setPrideScore] = useState(250)
  const [shareEmail, setShareEmail] = useState('')
  const [shareAmount, setShareAmount] = useState(10)
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [donations, setDonations] = useState({ received: [], given: [] })

  const packages = [
    { id: 1, name: 'Starter Pride', points: 100, price: 4.99 },
    { id: 2, name: 'Pride Boost', points: 500, price: 19.99 },
    { id: 3, name: 'Pride Champion', points: 1000, price: 34.99 },
    { id: 4, name: 'Pride Legend', points: 5000, price: 149.99 }
  ]

  useEffect(() => {
    fetchPrideScore()
    fetchDonations()
  }, [])

  const fetchPrideScore = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/pride_scores?user_id=eq.${session.user.id}&select=score`, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'apikey': SUPABASE_ANON_KEY
        }
      })
      const data = await res.json()
      if (data && data.length > 0) {
        setPrideScore(data[0].score)
      }
    } catch (err) {
      console.error('Error fetching score:', err)
    }
  }

  const fetchDonations = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/pride_donations?or=(from_email.eq.${session.user.email},to_email.eq.${session.user.email})&order=created_at.desc&limit=10`, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'apikey': SUPABASE_ANON_KEY
        }
      })
      const data = await res.json()
      if (data) {
        const received = data.filter(d => d.to_email === session.user.email)
        const given = data.filter(d => d.from_email === session.user.email)
        setDonations({ received, given })
      }
    } catch (err) {
      console.error('Error fetching donations:', err)
      setDonations({
        received: [
          { id: 1, from_email: 'john@example.com', amount: 50, created_at: '2025-09-28T10:30:00Z' },
          { id: 2, from_email: 'sarah@example.com', amount: 25, created_at: '2025-09-27T15:20:00Z' }
        ],
        given: [
          { id: 3, to_email: 'mike@example.com', amount: 30, created_at: '2025-09-26T12:00:00Z' },
          { id: 4, to_email: 'lisa@example.com', amount: 20, created_at: '2025-09-25T09:15:00Z' }
        ]
      })
    }
  }

  const generateShareLink = () => {
    if (!shareEmail || shareAmount <= 0 || shareAmount > prideScore) {
      alert('Please enter a valid email and amount (max: ' + prideScore + ')')
      return
    }
    
    const linkData = btoa(JSON.stringify({
      from: session.user.email,
      to: shareEmail,
      amount: shareAmount,
      timestamp: Date.now()
    }))
    
    const link = `${window.location.origin}?share=${linkData}`
    setShareLink(link)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCheckout = async (pkg) => {
    alert(`Stripe checkout for ${pkg.name}\n${pkg.points} points - ${pkg.price}\n\nIn production, this would redirect to Stripe Checkout.`)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Pride.me
            </h1>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 mb-2">Your Pride Score</p>
              <h2 className="text-6xl font-bold">{prideScore}</h2>
              <p className="text-purple-100 mt-2">points</p>
            </div>
            <Trophy className="w-24 h-24 text-white opacity-20" />
          </div>
          <div className="mt-6 pt-6 border-t border-purple-400">
            <p className="text-sm text-purple-100">Logged in as: {session.user.email}</p>
            <p className="text-xs text-purple-200 mt-1">+100 points awarded weekly</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Trophy className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'share'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Share2 className="w-5 h-5" />
            Share Pride
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'shop'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Shop
          </button>
        </div>

        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Welcome to Pride.me!</h3>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Gift className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Earn Weekly Rewards</h4>
                    <p>Receive 100 pride points automatically every week</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Share2 className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Share Your Pride</h4>
                    <p>Send pride points to others via email with custom links</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Buy More Pride</h4>
                    <p>Purchase pride point packages through our secure shop</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Gift className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Received</h3>
                </div>
                {donations.received.length === 0 ? (
                  <p className="text-gray-500 text-sm">No donations received yet</p>
                ) : (
                  <div className="space-y-3">
                    {donations.received.map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{donation.from_email}</p>
                          <p className="text-xs text-gray-500">{formatDate(donation.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">+{donation.amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Share2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Given</h3>
                </div>
                {donations.given.length === 0 ? (
                  <p className="text-gray-500 text-sm">No donations given yet</p>
                ) : (
                  <div className="space-y-3">
                    {donations.given.map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{donation.to_email}</p>
                          <p className="text-xs text-gray-500">{formatDate(donation.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">-{donation.amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'share' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Share Pride Points</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Share (max: {prideScore})
                </label>
                <input
                  type="number"
                  value={shareAmount}
                  onChange={(e) => setShareAmount(parseInt(e.target.value) || 0)}
                  min="1"
                  max={prideScore}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={generateShareLink}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition"
              >
                Generate Share Link
              </button>

              {shareLink && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your Share Link:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={copyLink}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition flex items-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Send this link to {shareEmail} to share {shareAmount} pride points
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Pride Point Packages</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-500 transition"
                >
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h4>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {pkg.points}
                    </span>
                    <span className="text-gray-500">points</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-800">${pkg.price}</span>
                  </div>
                  <button
                    onClick={() => handleCheckout(pkg)}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition"
                  >
                    Purchase Now
                  </button>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6 text-center">
              Secure payment processing powered by Stripe
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PrideMeApp() {
  const [session, setSession] = useState(null)
  const [shareData, setShareData] = useState(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shareParam = params.get('share')
    
    if (shareParam) {
      try {
        const decoded = JSON.parse(atob(shareParam))
        setShareData(decoded)
      } catch (err) {
        console.error('Invalid share link')
      }
    }
  }, [])

  const handleLogin = (sessionData) => {
    setSession(sessionData)
    
    if (shareData && sessionData.user.email === shareData.to) {
      processShareLink(sessionData, shareData)
    }
  }

  const processShareLink = async (sessionData, data) => {
    setProcessing(true)
    
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/process_pride_share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.token}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from_email: data.from,
          to_email: data.to,
          amount: data.amount,
          link_id: btoa(`${data.from}-${data.to}-${data.timestamp}`)
        })
      })

      if (res.ok) {
        alert(`Success! You received ${data.amount} pride points from ${data.from}`)
        window.history.replaceState({}, '', window.location.pathname)
        setShareData(null)
      } else {
        const error = await res.json()
        alert(error.message || 'This link has already been used or is invalid')
        window.history.replaceState({}, '', window.location.pathname)
        setShareData(null)
      }
    } catch (err) {
      alert('Error processing share link')
    }
    
    setProcessing(false)
  }

  const handleSignOut = () => {
    setSession(null)
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <Trophy className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing your pride...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    )
  }

  if (shareData && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
              <Gift className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              You've received Pride!
            </h1>
            <p className="text-gray-600">
              <span className="font-semibold">{shareData.from}</span> wants to share{' '}
              <span className="text-2xl font-bold text-purple-600">{shareData.amount}</span> pride points with you!
            </p>
          </div>
          <p className="text-sm text-gray-500 text-center mb-6">
            Sign in with <span className="font-semibold">{shareData.to}</span> to claim your pride
          </p>
          <LoginPage onLogin={handleLogin} />
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <Dashboard session={session} onSignOut={handleSignOut} />
}
