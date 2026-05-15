import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Phone, Mail, Send, CheckCircle, MessageSquareQuote } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ fullName: '', email: '', contactNumber: '', message: '' });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setFormData({ fullName: '', email: '', contactNumber: '', message: '' });
    setTimeout(() => setSuccess(false), 5000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-gray-900 border border-border animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col lg:flex-row">
        
        {/* LEFT SIDE - Info & Branding */}
        <div className="lg:w-5/12 bg-gradient-to-br from-primary to-accent p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">Get in touch with us</h1>
            <p className="text-white/80 text-lg mb-8">Let’s connect and figure solutions in no time!</p>
            
            <div className="bg-white/10 p-4 rounded-2xl inline-block mb-10 backdrop-blur-sm border border-white/20 shadow-lg">
              <MessageSquareQuote className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-6 mt-4">
              <div>
                <h3 className="text-lg font-semibold border-b border-white/20 pb-2 mb-4">Team Members</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-white text-lg">Priyanka M L</p>
                    <a href="tel:+916360012760" className="text-white/80 hover:text-white transition-colors flex items-center gap-2 mt-1 cursor-pointer hover:underline">
                      <Phone className="w-4 h-4" /> 6360012760
                    </a>
                  </div>
                  <div>
                    <p className="font-medium text-white text-lg">Reshma D</p>
                    <a href="tel:+916361288806" className="text-white/80 hover:text-white transition-colors flex items-center gap-2 mt-1 cursor-pointer hover:underline">
                      <Phone className="w-4 h-4" /> 6361288806
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/20">
                <a href="mailto:projectteam.1522@gmail.com" className="text-white/90 hover:text-white transition-colors flex items-center gap-3 font-medium cursor-pointer hover:underline">
                  <Mail className="w-5 h-5" /> projectteam.1522@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Form */}
        <div className="lg:w-7/12 p-10 lg:p-12 bg-gray-50 dark:bg-gray-800/30">
          <Card className="border-none shadow-none bg-transparent h-full flex flex-col justify-center">
            {success && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="w-5 h-5" /> Message sent successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-border bg-white dark:bg-gray-900 text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-border bg-white dark:bg-gray-900 text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Contact Number <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    name="contactNumber"
                    required
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-border bg-white dark:bg-gray-900 text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="+91 0000000000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Message <span className="text-red-500">*</span></label>
                <textarea 
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full p-3 rounded-xl border border-border bg-white dark:bg-gray-900 text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              
              <div className="pt-2">
                <Button type="submit" className="w-full py-3 flex justify-center items-center gap-2 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                  <Send className="w-5 h-5" /> Submit
                </Button>
              </div>
            </form>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
