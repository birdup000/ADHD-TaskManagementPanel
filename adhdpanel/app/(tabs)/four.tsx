import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import styled from "@emotion/styled";
import AGiXTSDK from "agixt";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AGIXT_API_URI_KEY = "agixtapi";
const AGIXT_API_KEY_KEY = "agixtkey";

const AppWrapper = styled.div`
  background-color: #121212;
  min-height: 100vh;
  padding: 1rem;
  font-family: 'Arial', sans-serif;
  color: #e0e0e0;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const Card = styled.div`
  background-color: #1e1e1e;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const CardHeader = styled.div`
  background-color: #2c3e50;
  color: #ffffff;
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;

const CardContent = styled.div`
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;

const CalendarTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #ffffff;

  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const CalendarContent = styled(CardContent)`
  .fc {
    font-family: 'Arial', sans-serif;
  }

  .fc-toolbar-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #e0e0e0;

    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }

  .fc-button-primary {
    background-color: #3498db;
    border-color: #2980b9;
    color: #ffffff;
    transition: all 0.3s ease;

    &:hover {
      background-color: #2980b9;
      border-color: #2980b9;
    }

    &:not(:disabled):active,
    &:not(:disabled).fc-button-active {
      background-color: #2980b9;
      border-color: #2980b9;
    }
  }

  .fc-prev-button,
  .fc-next-button {
    &:after {
      content: '';
      border: solid #ffffff;
      border-width: 0 2px 2px 0;
      display: inline-block;
      padding: 3px;
      transform: rotate(-45deg);
    }
  }

  .fc-prev-button:after {
    transform: rotate(135deg);
  }

  .fc-day {
    background-color: #2c3e50;
    border-color: #34495e;
  }

  .fc-day-today {
    background-color: #34495e !important;
  }

  .fc-daygrid-day-number,
  .fc-col-header-cell-cushion {
    color: #e0e0e0;
  }

  .fc-event {
    background-color: #3498db;
    border-color: #2980b9;
    color: #ffffff;
    border-radius: 4px;
    padding: 2px 4px;
  }

  .fc-view-harness {
    height: auto !important;
  }

  .fc-scrollgrid,
  .fc-theme-standard td,
  .fc-theme-standard th {
    border-color: #34495e;
  }

  .fc-scroller {
    height: auto !important;
  }

  .fc-daygrid-body {
    height: auto !important;
  }

  @media (max-width: 767px) {
    .fc-toolbar {
      flex-direction: column;
      gap: 1rem;
    }

    .fc-toolbar-chunk {
      display: flex;
      justify-content: center;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const Button = styled.button`
  background-color: #3498db;
  color: #ffffff;
  border: none;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #2980b9;
  }

  @media (min-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
`;

const EventsHeader = styled(CardHeader)`
  background-color: #27ae60;
`;

const EventsTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #ffffff;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const EventItem = styled.div`
  background-color: #2c3e50;
  border-left: 4px solid #3498db;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #e0e0e0;
`;

const CalendarApp = () => {
  const [events, setEvents] = useState([]);
  const [agixt, setAgixt] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const agixtApiUri = await AsyncStorage.getItem(AGIXT_API_URI_KEY);
        const agixtApiKey = await AsyncStorage.getItem(AGIXT_API_KEY_KEY);

        if (agixtApiUri && agixtApiKey) {
          const agixtInstance = new AGiXTSDK({
            baseUri: agixtApiUri,
            apiKey: agixtApiKey,
          });
          setAgixt(agixtInstance);
          handleAGiXTGetCalendarItems(agixtInstance);
        } else {
          console.error("AGiXT API URI or API Key not found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error loading AGiXT settings from AsyncStorage:", error);
      }
    };

    loadSettings();
  }, []);

  const handleAGiXTGetCalendarItems = async (agixtInstance) => {
    try {
      const items = await agixtInstance.getCalendarItems();
      setEvents(items.map(item => ({
        id: item.id,
        title: item.subject,
        start: item.start_time,
        end: item.end_time,
      })));
    } catch (error) {
      console.error("Error fetching AGiXT calendar items:", error);
    }
  };

  const handleAGiXTAddCalendarItem = async () => {
    try {
      if (agixt) {
        await agixt.addCalendarItem("New Event", new Date().toISOString(), new Date(Date.now() + 3600000).toISOString(), "Online");
        handleAGiXTGetCalendarItems(agixt);
      } else {
        console.error("AGiXT instance is not initialized");
      }
    } catch (error) {
      console.error("Error adding AGiXT calendar item:", error);
    }
  };

  const handleTestAddEntry = () => {
    const newEvent = {
      id: Date.now(),
      title: "Test Event",
      start: new Date(),
      end: new Date(Date.now() + 3600000),
    };
    setEvents([...events, newEvent]);
  };

  const handleCalendarSelect = (info) => {
    if (info.event) {
      const selectedEvent = info.event;
      console.log("Selected event:", selectedEvent);
    }
  };

  return (
    <AppWrapper>
      <Card>
        <CardHeader>
          <CalendarTitle>Calendar Integration</CalendarTitle>
        </CardHeader>
        <CalendarContent>
          <ButtonGroup>
            <Button onClick={() => handleAGiXTGetCalendarItems(agixt)}>List AGiXT Calendar Items</Button>
            <Button onClick={handleAGiXTAddCalendarItem}>Add AGiXT Calendar Item</Button>
            <Button onClick={handleTestAddEntry}>Test Add Entry</Button>
          </ButtonGroup>
          <FullCalendar
  plugins={[dayGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  events={events}
  dateClick={handleCalendarSelect}
  editable={true}
  headerToolbar={{
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek,dayGridDay'
  }}
  height="auto"
  eventDrop={(info) => {
    // Update the event's start and end dates
    const updatedEvent = {
      ...info.event,
      start: info.event.start,
      end: info.event.end,
    };
    setEvents(events.map((event) => event.id === updatedEvent.id ? updatedEvent : event));
  }}
  eventResize={(info) => {
    // Update the event's start and end dates
    const updatedEvent = {
      ...info.event,
      start: info.event.start,
      end: info.event.end,
    };
    setEvents(events.map((event) => event.id === updatedEvent.id ? updatedEvent : event));
  }}
/>
        </CalendarContent>
      </Card>
      <Card>
        <EventsHeader>
          <EventsTitle>Upcoming Events</EventsTitle>
        </EventsHeader>
        <CardContent>
          {events.length === 0 && <p>No events to show</p>}
          {events.map((event) => (
            <EventItem key={event.id}>{event.title}</EventItem>
          ))}
        </CardContent>
      </Card>
    </AppWrapper>
  );
}

export default CalendarApp;