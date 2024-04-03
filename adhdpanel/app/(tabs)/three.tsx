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

export const StyleWrapper = styled.div`
  color: white;

  .fc-event,
  .fc-daygrid-event,
  .fc-timegrid-event {
    color: white !important;
  }

  .fc-view-harness {
    width: 100%;
    height: 50vh;
  }

  overflow: auto;
  height: 350px;
`

const apiCalendar = new ApiCalendar(config);

const Three = () => {
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState('');

  useEffect(() => {
    const apiCalendar = new ApiCalendar(config);
  }, []);

  const handleItemClick = (event: SyntheticEvent<any>, name: string): void => {
    if (name === 'sign-in') {
      // Call the handleAuthClick method to sign in the user
      apiCalendar.handleAuthClick()
        .then((response: any) => {
          // Handle successful authentication
          console.log("User successfully signed in");
        })
        .catch((error: any) => {
          // Handle authentication failure
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
      console.log(result.items);
      setEvents(result.items);
    });
  };

  const handleListCalendars = () => {
    apiCalendar.listCalendars().then(({ result }: any) => {
      console.log(result.items);
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
    <div>
      <h2 style={{ color: 'white' }}>Calendar-Integration</h2>
      <div style={{ padding: "0.5em" }}>
        <button style={{ color: 'blue' }} onClick={(e: SyntheticEvent<any>) => handleItemClick(e, "sign-in")}>sign-in</button>
        <button style={{ color: 'blue' }} onClick={(e: SyntheticEvent<any>) => handleItemClick(e, "sign-out")}>
          sign-out
        </button>
      </div>
      <div style={{ padding: "0.5em" }}>
        <button style={{ color: 'blue' }} onClick={handleCreateEventFromNow}>
          Create Event from now
        </button>
      </div>
      <div style={{ padding: "0.5em" }}>
        <button style={{ color: 'blue' }} onClick={handleListUpcomingEvents}>
          List upcoming events
        </button>
        <div>
          <h4 style={{ color: 'white' }}>Events</h4>
          {events.length === 0 && <p>No events to show</p>}
          {events.map((event: any) => (
            <p key={event.id}>{JSON.stringify(event)}</p>
          ))}
        </div>
      </div>
      <div style={{ padding: "0.5em" }}>
        <button style={{ color: 'blue' }} onClick={handleListCalendars}>
          List calendars
        </button>
        <div>
     <h4 style={{ color: 'white' }}>Calendars</h4>
      {calendars.length === 0 && <p style={{ color: 'white' }}>No calendars to show</p>}
    {calendars.map((calendar: any) => (
      <p key={calendar.id}>{JSON.stringify(calendar)}</p>
        ))}
    </div>

      </div>
      <div style={{ padding: "0.5em" }}>
        <button style={{ color: 'blue' }} onClick={handleCreateCalendar}>
          Create calendar
        </button>
      </div>
      <div style={{ padding: "0.5em" }}>
        <StyleWrapper>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleCalendarSelect}
          />
        </StyleWrapper>
      </div>
    </div>
  );
}

export default Three;
