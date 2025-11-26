import React from 'react';
import { CalendarEvent } from '../types';

interface EventCardProps {
  event: CalendarEvent;
  onDownload: () => void;
  onReset: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onDownload, onReset }) => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
      <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
        <h2 className="text-white font-semibold text-lg">Event Preview</h2>
        <span className="bg-indigo-500 text-indigo-50 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-medium">Ready</span>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{event.summary}</h3>
          {event.location && (
            <p className="text-gray-500 flex items-center mt-1">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Date</p>
            <p className="text-gray-800 font-medium">{dateFormatter.format(startDate)}</p>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Time</p>
            <p className="text-gray-800 font-medium">
              {timeFormatter.format(startDate)} &ndash; {timeFormatter.format(endDate)}
            </p>
          </div>
        </div>

        {event.description && (
          <div>
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
             <p className="text-gray-600 text-sm whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {event.attendees && event.attendees.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Guests</p>
            <div className="flex flex-wrap gap-2">
              {event.attendees.map((email, idx) => (
                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {email}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-100">
        <button
          onClick={onDownload}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download .ics
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          New Event
        </button>
      </div>
    </div>
  );
};

export default EventCard;