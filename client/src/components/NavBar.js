import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import LogOut from "./session/LogOut";
import User from "./users/User";
import Home from "./games/Home";
import EditGame from "./games/EditGame";

import AuthContext from '../auth';

const NavBar = () => {
  const { fetchWithCSRF, currentUser } = useContext(AuthContext);

  const head = (
    <h1>
        <p align="center">
            Welcome {currentUser ? `${currentUser.nickName} ` : ""} to volleyball meetup!
        </p>
    </h1>
);

  return (
    <>
        <h1>
            <p align="center">
                Welcome {currentUser ? `${currentUser.nickName} ` : ""} to volleyball meetup!
            </p>
        </h1>
        <p align="center">{!currentUser ? null :
            <>
                <NavLink
                    exact to="/"
                    className="nav"
                    activeClassName="active"
                >
                    Home
                </NavLink>
                <NavLink
                    to="/edituser"
                    className="nav" activeClassName="active"
                >
                    Account Details
                </NavLink>
                <NavLink to="/logout" className="nav" activeClassName="active"
                >
                    LogOut
                </NavLink>
            </>}
        </p>
    </>
  )
}

export default NavBar;