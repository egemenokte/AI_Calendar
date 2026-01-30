import React, { useState } from 'react';
import { CalendarEvent } from './types';
import { parseEventFromText } from './services/geminiService';
import { downloadICS } from './utils/icsUtils';
import EventCard from './components/EventCard';

const SAMPLE_TEXT = `Join us for the Water Polo Enthusiast Meetup 
happening on Saturday, July 19, 2025, 
 at 4:15 PM - 5:15 PM ET. 
We’ll be gathering at the Bluefin Aquatic Center, 
located at 47 Seabreak Loop, Coralview Heights`;

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedEvent, setParsedEvent] = useState<CalendarEvent | null>(null);
  
  // Detect user's timezone from browser
  const [userTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setParsedEvent(null);

    try {
      const result = await parseEventFromText(inputText, userTimezone);
      if (result.success && result.event) {
        setParsedEvent(result.event);
      } else {
        setError(result.error || "Could not parse event.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (parsedEvent) {
      downloadICS(parsedEvent);
    }
  };

  const handleReset = () => {
    setParsedEvent(null);
    setInputText('');
    setError(null);
  };

  const fillSample = () => {
    setInputText(SAMPLE_TEXT);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">QuickCalendar</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10 max-w-2xl">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Turn text into <span className="text-indigo-600">Calendar Invites</span>
          </h2>
          <p className="text-lg text-gray-600">
            Paste an email, a flyer text, or a message. We'll extract the details and give you an .ics file for Outlook, Google Calendar, or Apple Calendar.
          </p>
        </div>

        {!parsedEvent ? (
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-100 transform transition-all overflow-hidden">
            
            {/* Timezone Indicator Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
               <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Input</span>
               </div>
               <div className="flex items-center text-xs text-gray-600 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm" title="This is your detected timezone">
                  <svg className="w-3.5 h-3.5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>
                    <span className="text-gray-400 mr-1">Your Timezone:</span>
                    <span className="font-semibold text-gray-800">{userTimezone}</span>
                  </span>
               </div>
            </div>

            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste event details here... e.g., 'Team lunch at Joe's Pizza, Friday at 1pm ET'"
                className="w-full h-48 p-4 text-gray-700 bg-white resize-none focus:outline-none focus:bg-indigo-50/10 text-lg placeholder-gray-300 border-none"
              />
              
              {/* Helper actions inside the box area */}
              <div className="absolute bottom-4 left-4">
                 <button 
                  onClick={fillSample}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded transition-colors"
                >
                  Try Example
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-b-lg border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-gray-400 pl-2 leading-tight max-w-xs text-center sm:text-left">
                If your timezone is different, please explicitly state it in the text.
              </div>
              <button
                onClick={handleGenerate}
                disabled={isLoading || !inputText.trim()}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white shadow-md transition-all w-full sm:w-auto justify-center
                  ${isLoading || !inputText.trim() 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'}
                `}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Generate .ics
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <EventCard 
            event={parsedEvent} 
            onDownload={handleDownload} 
            onReset={handleReset} 
          />
        )}

        {error && (
          <div className="mt-6 w-full max-w-2xl bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            QuickCalendar. Vibecoded by Egemen Okte
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;