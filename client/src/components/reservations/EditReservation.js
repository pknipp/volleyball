import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

import Context from '../../context';

const EditReservation = ({ match }) => {
  const resGameId = match.params.resGameId;
  const [reservationId, gameId] = resGameId.split('-').map(id => Number(id));
  const { fetchWithCSRF, currentUser, rerender, setRerender } = useContext(Context);
  const [bools, setBools] = useState([[]]);
  const nullReservation = bools.reduce((pojo, prop) => {
    return {...pojo, [prop]: false};
  }, {id: 0, playerId: 0, gameId: 0, game: {Location: '', dateTime: ''}});
  const [reservation, setReservation] = useState({...nullReservation,
    playerId: currentUser.id,
    id: reservationId,
    gameId
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);

  let history = useHistory();

  useEffect(() => {
    (async() => {
      const res = await fetch(`/api/reservations/${resGameId}`);
      let newReservation = {...reservation, ...(await res.json()).reservation};
      Object.keys(newReservation).forEach(key => {
        if (newReservation[key] === null) newReservation[key] = key === 'Extra info' ? '' : false;
      })
      newReservation.game.dateTime = moment(newReservation.game.dateTime).local().format().slice(0,-9);

      setReservation(newReservation);
      const newBools = newReservation.game.bools || [];
      for (let i = 0; i < newBools.length; i++) {
        const boolVal = newReservation.bools % 2;
        newBools[i] = [newBools[i], !!boolVal];
        newReservation.bools -= boolVal;
        newReservation.bools /= 2;
      }
      setBools(newBools);
    })();
  }, [reservation.id]);



  const handlePutPost = async e => {
    reservation.bools = [...bools].reverse().reduce((tot, bool) => {
      return 2 * tot + Number(bool[1]);
    }, 0);
    e.preventDefault();
    const res = await fetch(`/api/reservations${reservation.id ? ('/' + reservation.id) : ''}`, { method: reservation.id ? 'PUT': 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservation)
    });
    let newReservation = (await res.json()).reservation;
    if (reservation.id) {
      // PUT route
      setMessage("Success");
    } else {
      // POST route
      history.push('/');
    }
    setReservation(newReservation);
    // Is the following line necessary?
    setRerender(rerender + 1);
  };

  const handleDelete = async e => {
    e.preventDefault();
    const res = await fetch(`/api/reservations/${reservation.id}`, { method: 'DELETE'});
    if (res.ok) {
      setReservation(JSON.parse(JSON.stringify(nullReservation)));
      // Is the following unnecessary?
      setRerender(rerender + 1);
      history.push('/');
    }
  }

  return (
    <div className="simple">
      <form className="auth" onSubmit={handlePutPost}>
        <h3>
          {reservation.id ? "Change" : "Choose"} your reservation details for the {reservation.game.Sport && reservation.game.Sport.toLowerCase()} game at {reservation.game.Location} on &nbsp;
          {reservation.game.dateTime.split('T')[0]} at &nbsp;
          {reservation.game.dateTime.split('T')[1]}.
        </h3>
        <span><h4>Your preferences:</h4></span>
        <div>
        {bools.map((bool, index) => (
          <div key={index} className="checkboxPair">
            <div><span>{bool[0]}:</span></div>
            <div><input
              name={bool[0]}
              type="checkbox"
              checked={bool[1]}
              onChange={e => {
                const newBools = [...bools];
                newBools[index][1] = e.target.checked;
                setBools(newBools);
              }}
            /></div>
          </div>
        ))}
        </div>

        <span><h4>Extra info about your reservation (optional):</h4></span>
        <input
          type="text" placeholder="Extra info" name="Extra info" value={reservation['Extra info']}
          onChange={e => setReservation({...reservation, ['Extra info']: e.target.value})}
        />

        <button color="primary" variant="outlined" type="submit">
          {reservation.id ? "Modify" : "Make"} reservation
        </button>
        <span style={{color: "red", paddingLeft:"10px"}}>{message}</span>
      </form>
      {!reservation.id ? null :
        <form className="auth" onSubmit={handleDelete}>
          <button color="primary" variant="outlined" type="submit">
            Cancel reservation
          </button>
        </form>
      }
    </div>
  );
}

export default EditReservation;
