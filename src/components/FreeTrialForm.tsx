'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FreeTrialForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    academyName: '',
    studentsCount: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };
  
  // Add a show method that can be called from outside
  const show = () => {
    setIsVisible(true);
  };

  // Expose the show method to the window object
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.showFreeTrialForm = show;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/free-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process your request');
      }
      
      setSuccess(true);
      
      // If we're in development, show the generated password
      if (data.password) {
        setPassword(data.password);
      }
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        academyName: '',
        studentsCount: '',
      });
      
      // Redirect to dashboard or thank you page after a delay
      setTimeout(() => {
        handleClose();
        // Uncomment to redirect to a thank you page
        // router.push('/thank-you');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-free-trial-form className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isVisible ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto relative max-h-[90vh] overflow-y-auto my-4 md:my-0">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Start Your Free Trial</h2>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-4">
                Your free trial has been activated. We've created an academy account for you.
              </p>
              
              {password && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-gray-700 mb-2">Your login credentials:</p>
                  <p className="text-sm"><strong>Email:</strong> {formData.email}</p>
                  <p className="text-sm"><strong>Password:</strong> {password}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Please save these credentials. In a production environment, 
                    this password would be sent to your email.
                  </p>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-4">
                This window will close automatically in a few seconds.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                  />
                </div>
                
                <div>
                  <label htmlFor="academyName" className="block text-sm font-medium text-gray-700">Academy Name</label>
                  <input
                    type="text"
                    id="academyName"
                    name="academyName"
                    value={formData.academyName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                  />
                </div>
                
                <div>
                  <label htmlFor="studentsCount" className="block text-sm font-medium text-gray-700">Number of Students</label>
                  <select
                    id="studentsCount"
                    name="studentsCount"
                    value={formData.studentsCount}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                  >
                    <option value="">Select</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-100">51-100</option>
                    <option value="100+">More than 100</option>
                  </select>
                </div>
                
                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 md:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm md:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Start Free Trial'
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}