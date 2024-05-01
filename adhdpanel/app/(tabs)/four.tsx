import React, { SyntheticEvent, useState, useEffect } from 'react';
import ApiCalendar from 'react-google-calendar-api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import styled from "@emotion/styled";

const config = {
  "clientId": "CLIENT_ID",
  "apiKey": "API_KEY",
  "scope": "https://www.googleapis.com/auth/calendar",
  "discoveryDocs": [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
  ]
}

const apiCalendar = new ApiCalendar(config);

const CalendarWrapper = styled.div`
  background-color: #1e1e1e;
  color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  .fc-event,
  .fc-daygrid-event,
  .fc-timegrid-event {
    background-color: #2d2d2d !important;
    border-color: #3d3d3d !important;
    color: #fff !important;
    padding: 0.5rem !important;
    border-radius: 4px !important;
  }

  .fc-view-harness {
    width: 100%;
    height: 70vh;
  }

  .fc-toolbar-title {
    font-size: 1.5rem !important;
    font-weight: bold !important;
  }

  .fc-button {
    background-color: #2d2d2d !important;
    border-color: #3d3d3d !important;
    color: #fff !important;
    padding: 0.5rem 1rem !important;
    border-radius: 4px !important;
    font-size: 1rem !important;
    transition: background-color 0.3s ease !important;

    &:hover {
      background-color: #3d3d3d !important;
    }
  }

  overflow: auto;
  height: auto;

  @media (max-width: 768px) {
    padding: 1rem;

    .fc-view-harness {
      height: 60vh;
    }

    .fc-toolbar-title {
      font-size: 1.25rem !important;
    }

    .fc-button {
      font-size: 0.875rem !important;
      padding: 0.25rem 0.5rem !important;
    }
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  button {
    background-color: #2d2d2d;
    border: none;
    color: white;
    padding: 0.75rem 1.5rem;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 0.5rem;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #3d3d3d;
    }

    @media (max-width: 768px) {
      font-size: 14px;
      padding: 0.5rem 1rem;
    }
  }
`;

const EventsWrapper = styled.div`
  margin-top: 2rem;

  h4 {
    color: #fff;
    margin-bottom: 0.75rem;
  }

  p {
    color: #ccc;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 768px) {
    h4 {
      font-size: 1.1rem;
    }

    p {
      font-size: 0.9rem;
    }
  }
`;

const CalendarApp = () => {
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState('');

  useEffect(() => {
    const apiCalendar = new ApiCalendar(config);
  }, []);

  const handleItemClick = (event: SyntheticEvent<any>, name: string): void => {
    if (name === 'sign-in') {
      apiCalendar.handleAuthClick()
        .then((response: any) => {
          console.log("User successfully signed in");
        })
        .catch((error: any) => {
          console.error("Error signing in:", error);
        });
    } else if (name === 'sign-out') {
      apiCalendar.handleSignoutClick();
    }
  };

  const handleCreateEventFromNow = () => {
    const eventFromNow = {
      summary: "Poc Dev From Now",
      time: 480,
    };

    apiCalendar.createEventFromNow(eventFromNow)
      .then((result: any) => {
        console.log(result);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const handleListUpcomingEvents = () => {
    apiCalendar.listUpcomingEvents(10).then(({ result }: any) => {
      setEvents(result.items);
    });
  };

  const handleListCalendars = () => {
    apiCalendar.listCalendars().then(({ result }: any) => {
      setCalendars(result.items);
    });
  };

  const handleCreateCalendar = () => {
    apiCalendar.createCalendar("myCalendar2").then(({ result }: any) => {
      console.log(result);
    });
  };

  const handleCalendarSelect = (info: any) => {
    if (info.event) {
      const selectedEvent = info.event;
      setSelectedCalendar(selectedEvent.id);
    }
  };

  return (
    <CalendarWrapper>
      <h1>Calendar Integration</h1>
      <ButtonWrapper>
        <button onClick={(e: SyntheticEvent<any>) => handleItemClick(e, "sign-in")}>Sign In</button>
        <button onClick={(e: SyntheticEvent<any>) => handleItemClick(e, "sign-out")}>Sign Out</button>
        <button onClick={handleCreateEventFromNow}>Create Event</button>
        <button onClick={handleListUpcomingEvents}>List Events</button>
        <button onClick={handleListCalendars}>List Calendars</button>
        <button onClick={handleCreateCalendar}>Create Calendar</button>
      </ButtonWrapper>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleCalendarSelect}
        eventColor="#2d2d2d"
        eventBorderColor="#3d3d3d"
        eventTextColor="#fff"
        headerToolbar={{
          left: 'prev,next today addEventButton',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        customButtons={{
          addEventButton: {
            text: 'Add Event',
            click: handleCreateEventFromNow
          }
        }}
      />
      <EventsWrapper>
        <h4>Events</h4>
        {events.length === 0 && <p>No events to show</p>}
        {events.map((event: any) => (
          <p key={event.id}>{event.summary}</p>
        ))}
        <h4>Calendars</h4>
        {calendars.length === 0 && <p>No calendars to show</p>}
        {calendars.map((calendar: any) => (
          <p key={calendar.id}>{calendar.summary}</p>
        ))}
      </EventsWrapper>
    </CalendarWrapper>
  );
}

export default CalendarApp;