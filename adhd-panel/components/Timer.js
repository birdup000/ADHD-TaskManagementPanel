import React, { useState, useEffect } from "react";

function Timer() {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [timerOn, setTimerOn] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerOn && (time.hours !== 0 || time.minutes !== 0 || time.seconds !== 0)) {
      interval = setInterval(() => {
        setTime(prevTime => {
          if(prevTime.seconds > 0) return {...prevTime, seconds: prevTime.seconds - 1};
          else if(prevTime.minutes > 0) return {...prevTime, minutes: prevTime.minutes - 1, seconds: 59};
          else return {...prevTime, hours: prevTime.hours - 1, minutes: 59, seconds: 59};
        });
      }, 1000);
    } else {
      clearInterval(interval);
      setTimerOn(false);
    }
    return () => clearInterval(interval);
  }, [timerOn, time]);

  const handleStart = () => setTimerOn(true);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column", backgroundColor: "#282c34", color: "#fff"}}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem", textAlign: "center"}}>Timer</h1>
      <div style={{ fontSize: "4rem", marginBottom: "2rem"}}>{`${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`}</div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <input style={{ marginRight: "20px", width: "50px" }} type="number" placeholder='Hrs' onChange={(e) => setTime({...time, hours: parseInt(e.target.value)})}/>
        <input style={{ marginRight: "20px", width: "50px" }} type="number" placeholder='Mins' onChange={(e) => setTime({...time, minutes: parseInt(e.target.value)})}/>
        <input style={{ marginRight: "20px", width: "50px" }} type="number" placeholder='Secs' onChange={(e) => setTime({...time, seconds: parseInt(e.target.value)})}/>
        <button onClick={handleStart} style={{ marginLeft: "20px", padding: "10px", fontSize: "1rem", backgroundColor: "#444", color: "#fff", border: "none", borderRadius: "5px" }}>
      Start</button>
    </div>
  </div>
    
  );
}

export default Timer;
