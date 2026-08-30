import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  Mail, 
  User, 
  GraduationCap, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Cake,
  ShieldCheck,
  Clock
} from 'lucide-react';

export const SignInScreen: React.FC = () => {
  const { loginCustomer, loginWithGoogle, registerCustomer, setCurrentScreen } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNumber, setRollNumber] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    if (!auth) {
      setErrorMessage('Google Sign-In requires Firebase configuration. Please sign in with Email & Password below or configure VITE_FIREBASE_API_KEY.');
      return;
    }
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Send verified Google identity to our backend
      const res = await loginWithGoogle({
        name: user.displayName || 'Student',
        email: user.email || '',
        googleId: user.uid,
        avatarUrl: user.photoURL || '',
      });

      if (res.success) {
        setSuccessMessage('Google Sign-In successful!');
      } else {
        setErrorMessage(res.error || 'Google authentication failed.');
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed popup
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage('Domain not authorized in Firebase Auth.');
      } else {
        setErrorMessage(err.message || 'Google Sign-In failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const res = await loginCustomer(email.trim(), password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Logged in successfully!');
    } else {
      setErrorMessage(res.error || 'Failed to log in.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    const res = await registerCustomer({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      phone: phone.trim(),
      rollNumber: rollNumber.trim().toUpperCase()
    });
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Account created successfully!');
    } else {
      setErrorMessage(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F5] via-[#FFF5F7] to-[#FAF7F5] text-[#2A050F] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Brand Logo & Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-rose-600 text-white shadow-xl shadow-rose-600/30 mb-1">
          <Cake className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#2A050F] tracking-tight">
          CakeCampus
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
          Campus Pre-Order Cake Portal • Fresh baking &amp; fixed on-campus pickup
        </p>

        {/* Features banner */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-600 font-medium pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Campus Pickups
          </span>
          <span className="text-zinc-300">•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-rose-600" />
            Daily 6 PM Cutoff
          </span>
        </div>
      </div>

      {/* Auth Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 sm:px-8 shadow-xl shadow-rose-950/5 rounded-3xl border border-[#F3EAE3] space-y-5">
          {/* Header Title */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-[#2A050F] font-serif">
              {mode === 'register' ? 'Create Student Account' : 'Sign In to Continue'}
            </h2>
            <p className="text-xs text-zinc-400">
              Sign in with your campus details to choose your college &amp; browse cakes
            </p>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google One-Click Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl border-2 border-[#E8DED6] hover:border-zinc-400 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer group"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-zinc-200"></div>
            <span className="shrink mx-3 text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
              or with password
            </span>
            <div className="grow border-t border-zinc-200"></div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="bg-[#FAF7F5] p-1 rounded-xl flex items-center gap-1 text-xs font-bold border border-[#E8DED6]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-rose-600 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-rose-600 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Register
            </button>
          </div>

          {mode === 'login' ? (
            /* --- EMAIL LOGIN FORM --- */
            <form onSubmit={handleEmailLogin} className="space-y-3.5 animate-fade-in">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#FAF7F5] border border-[#E8DED6] focus:border-rose-500 focus:outline-hidden text-xs text-[#2A050F]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#FAF7F5] border border-[#E8DED6] focus:border-rose-500 focus:outline-hidden text-xs text-[#2A050F]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>Sign In with Password</span>
              </button>
            </form>
          ) : (
            /* --- REGISTRATION FORM --- */
            <form onSubmit={handleRegister} className="space-y-3 animate-fade-in">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Charan Veesam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FAF7F5] border border-[#E8DED6] focus:border-rose-500 focus:outline-hidden text-xs text-[#2A050F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700">Student Roll No.</label>
                  <input
                    type="text"
                    placeholder="21VV1A0589"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F5] border border-[#E8DED6] focus:border-rose-500 focus:outline-hidden text-xs text-[#2A050F] uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700">Phone</label>
                  <input
                    type="tel"
                    placeholder="9848034567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F5] border border-[#E8DED6] focus:border-rose-500 focus:outline-hidden text-xs text-[#2A050F]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Email Address</label>
                <input
                  type="email"
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F5] border border-[#E8DED6] focus:border-rose-500 focus:outline-hidden text-xs text-[#2A050F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700">Password</label>
                <input
                  type="password"
                  placeholder="Create password (min 4 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F5] border border-[#E8DED6] focus:border-rose-500 focus:outline-hidden text-xs text-[#2A050F]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                <span>Create Account</span>
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <button
              onClick={() => setCurrentScreen('admin')}
              className="text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors font-medium cursor-pointer"
            >
              Are you an Admin? Go to Admin Portal →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
