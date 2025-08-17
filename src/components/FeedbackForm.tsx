import React, { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

interface FeedbackFormProps {
  isDark: boolean;
  context?: string; // e.g., "categorization", "comparison", "general"
  onClose?: () => void;
}

export default function FeedbackForm({ isDark, context = 'general', onClose }: FeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simple email submission using mailto (client-side)
      const subject = encodeURIComponent(`Bank Statement Comparison Feedback - ${context}`);
      const body = encodeURIComponent(`Feedback Context: ${context}\n\nUser Feedback:\n${feedback}\n\nTimestamp: ${new Date().toISOString()}`);
      const mailtoLink = `mailto:feedback@statementcompare.com?subject=${subject}&body=${body}`;
      
      window.open(mailtoLink);
      
      setSubmitStatus('success');
      setFeedback('');
      
      // Auto-close after success
      setTimeout(() => {
        setIsOpen(false);
        setSubmitStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Feedback submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFeedback('');
      setSubmitStatus('idle');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleForm}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isDark
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
        }`}
        title="Send feedback"
      >
        <MessageCircle className="h-4 w-4" />
        Feedback
      </button>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
      isDark ? 'bg-black/50' : 'bg-black/30'
    }`}>
      <div className={`w-full max-w-md rounded-xl shadow-xl ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Send Feedback
          </h3>
          <button
            onClick={toggleForm}
            className={`p-1 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
             
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 rounded-lg border resize-none ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Tell us what you think, what could be improved, or report any issues..."
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !feedback.trim()}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isSubmitting || !feedback.trim()
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Feedback
              </>
            )}
          </button>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="p-3 rounded-lg bg-green-100 text-green-800 text-sm">
              ✅ Feedback sent successfully! Thank you.
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="p-3 rounded-lg bg-red-100 text-red-800 text-sm">
              ❌ Failed to send feedback. Please try again.
            </div>
          )}

          {/* Note */}
          <p className={`text-xs text-center ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            This will open your email client to send feedback directly to our team.
          </p>
        </form>
      </div>
    </div>
  );
}
