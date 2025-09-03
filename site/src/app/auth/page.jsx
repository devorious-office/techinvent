'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, Phone, Fingerprint, KeyRound, Check } from 'lucide-react';

// Reusable Input component with icon and error message
const Input = ({ icon, error, ...props }) => (
  <div className="relative mb-4">
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
      {icon}
    </div>
    <input
      {...props}
      className={`w-full bg-gray-700/50 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-lg py-2 pl-10 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200`}
    />
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-1 text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

// Main Authentication Page Component
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', employeeId: '', phoneNumber: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [stage, setStage] = useState('form'); // 'form', 'otp', 'success'
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  // Real-time validation
  useEffect(() => {
    validate();
  }, [formData, isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!isLogin) {
      if (!formData.name) newErrors.name = 'Name is required.';
      if (!formData.employeeId) {
        newErrors.employeeId = 'Employee ID is required.';
      } else if (!/^[eE]\d+$/.test(formData.employeeId)) {
        newErrors.employeeId = "Must be valid Emp Id";
      }
      if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required.';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }
    if (!formData.email) newErrors.email = 'Email is required.';
    if (!formData.password) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setServerMessage('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStage('otp');
    } catch (error) {
      setServerMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setServerMessage('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setServerMessage(data.message);
      setStage('success');
    } catch (error) {
      setServerMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

 const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setServerMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // On successful login, redirect to the main proposal form page
      window.location.href = '/'; 

    } catch (error) {
      setServerMessage(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="w-full max-w-md bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden"
    >
      <div className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in-down">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto rounded-full"></div>
        </div>

        <AnimatePresence mode="wait">
          {stage === 'form' && (
            <motion.form
              key="form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -50 }}
              onSubmit={isLogin ? handleLogin : handleSendOtp}
            >
              {!isLogin && (
                <>
                  <motion.div variants={itemVariants}><Input icon={<User size={16} />} type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} error={errors.name} /></motion.div>
                  <motion.div variants={itemVariants}><Input icon={<Fingerprint size={16} />} type="text" name="employeeId" placeholder="Employee ID (e.g., E12345)" value={formData.employeeId} onChange={handleChange} error={errors.employeeId} /></motion.div>
                  <motion.div variants={itemVariants}><Input icon={<Phone size={16} />} type="tel" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} error={errors.phoneNumber} /></motion.div>
                </>
              )}
              <motion.div variants={itemVariants}><Input icon={<Mail size={16} />} type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} error={errors.email} /></motion.div>
              <motion.div variants={itemVariants}><Input icon={<Lock size={16} />} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} error={errors.password} /></motion.div>
              {!isLogin && (
                <motion.div variants={itemVariants}><Input icon={<Lock size={16} />} type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} /></motion.div>
              )}

              {serverMessage && <p className="text-center text-sm text-red-400 my-4">{serverMessage}</p>}

              <motion.div variants={itemVariants}>
                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition duration-300 disabled:opacity-50 flex items-center justify-center">
                  {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isLogin ? 'Login' : 'Continue')}
                </button>
              </motion.div>
            </motion.form>
          )}

          {stage === 'otp' && (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              onSubmit={handleSignup}
              className="text-center"
            >
              <p className="text-gray-300 mb-4">An OTP has been sent to {formData.email}. Please enter it below.</p>
              <Input icon={<KeyRound size={16} />} type="text" name="otp" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength="6" />
              {serverMessage && <p className="text-center text-sm text-red-400 my-4">{serverMessage}</p>}
              <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition duration-300 disabled:opacity-50 flex items-center justify-center">
                {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Verify & Create Account'}
              </button>
              <button onClick={() => setStage('form')} className="text-sm text-cyan-400 mt-4 hover:underline">Back to form</button>
            </motion.form>
          )}
          
          {stage === 'success' && (
             <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <Check size={40} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{serverMessage}</h2>
              <p className="text-gray-300">You can now log in with your credentials.</p>
              <button onClick={() => { setStage('form'); setIsLogin(true); }} className="mt-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition duration-300">
                Go to Login
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {stage !== 'success' && (
          <div className="text-center mt-6">
            <button onClick={() => { setIsLogin(!isLogin); setServerMessage(''); setErrors({}); }} className="text-sm text-cyan-400 hover:underline">
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}