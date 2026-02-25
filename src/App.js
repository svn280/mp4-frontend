import React, { useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import EventGrid from './components/EventGrid';
import AddEventForm from './components/AddEventForm';
import './App.css';
import { useQuery, useQueryClient, useMutation} from '@tanstack/react-query';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const FETCH_EVENTS_URL = `${API_BASE}/data`;
const ADD_EVENT_URL = `${API_BASE}/events`;

const fetchEvents = async () => {
  const response = await fetch(FETCH_EVENTS_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  const json = await response.json();
  return json.data;
};

function App({}) {
  const queryClient = useQueryClient(); 
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });

  const addEvent = async (newEvent) => {
    const response = await fetch(ADD_EVENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    });
    if (!response.ok) {
      throw new Error('Failed to add event');
    }
    return response.json();
  };

  const mutation = useMutation({
    mutationFn: addEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowForm(false);
    },
  });

  const handleAddEvent = (newEvent) => {
    mutation.mutate(newEvent);
  };

  return (
    <div className="App">
      <Header />

      <div className="search-plus-bar">
        <SearchBar query={query} setQuery={setQuery} />
        <button className="plus-button" onClick={() => setShowForm(true)}>+</button>
      </div>

      {isLoading ? (
        <p style={{ textAlign: 'center' }}>Loading events...</p>
      ) : error ? (
        <p style={{ textAlign: 'center' }}>Error loading events: {error.message}</p>
      ) : (
        <EventGrid query={query} events={events} />
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AddEventForm onAddEvent={handleAddEvent} />
          </div>
        </div>
      )}

    </div>
  );
}

export default App;