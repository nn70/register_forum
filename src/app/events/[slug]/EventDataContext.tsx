'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EventData {
    name: string;
    email: string;
    phone: string;
}

interface EventDataContextType {
    eventData: EventData;
    setEventData: (data: Partial<EventData>) => void;
}

const EventDataContext = createContext<EventDataContextType | undefined>(undefined);

export function EventDataProvider({ children }: { children: ReactNode }) {
    const [eventData, setEventDataState] = useState<EventData>({
        name: '',
        email: '',
        phone: ''
    });

    const setEventData = (data: Partial<EventData>) => {
        setEventDataState(prev => ({ ...prev, ...data }));
    };

    return (
        <EventDataContext.Provider value={{ eventData, setEventData }}>
            {children}
        </EventDataContext.Provider>
    );
}

export function useEventData() {
    const context = useContext(EventDataContext);
    if (context === undefined) {
        throw new Error('useEventData must be used within an EventDataProvider');
    }
    return context;
}
