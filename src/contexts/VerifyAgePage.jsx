import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import { validateCode } from '../utils/validators.js';

const VerifyAgePage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [code, setCode] = useState(['', '', '']);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (isAuthenticated) { navigate('/chat'); return; }
    setTimeout(() => inputRefs[0].current?.focus(), 100);
  }, [isAuthenticated, navigate]);

  const handleInputChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');
    if (value && index < 2) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    const validation = validateCode(fullCode);
    if (!validation.valid) { setError(validation.message); return; }

    setLoading(true);
    const result = await login(fullCode, rememberMe);
    if (result.success) navigate('/chat');
    else setError(result.message || 'Invalid code');
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Background Party Tom - ASLI, tidak diubah */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/party-tom.png)' }}
      />

      {/* White overlay */}
      <div className="absolute inset-0 bg-white/80" />

      {/* Content - NO TEXT AT ALL except checkbox label */}
      <div className="relative flex-1 flex flex-col items-center justify-end pb-20 px-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Code input boxes - NO LABEL, NO TITLE */}
          <div className="flex justify-center gap-3 mb-4">
            {code.map((char, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode={index < 2 ? "numeric" : "text"}
                maxLength={1}
                value={char}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-16 h-16 text-center text-2xl font-bold bg-white border-2 border-primary rounded-xl 
                         focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30
                         text-background placeholder-text-muted/30"
                placeholder={index < 2 ? "0" : "!"}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                      className="text-error text-center text-sm mb-3">
              {error}
            </motion.p>
          )}

          {/* Remember me */}
          <label className="flex items-center justify-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-primary rounded"
            />
            <span className="text-sm text-text-muted">Remember Me</span>
          </label>

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={loading || code.some(c => !c)}
            className="w-full py-4 gradient-btn rounded-xl text-lg font-bold 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'VERIFY'}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyAgePage;