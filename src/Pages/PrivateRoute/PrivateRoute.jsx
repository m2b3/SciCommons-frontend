import React from 'react'
import { Route, Navigate } from 'react-router-dom'
import { useGlobalContext } from '../../Context/StateContext'

const PrivateRoute = ({ redirectTo, component}) => {

    const {token} = useGlobalContext();

    return token!==null ?  component : <Navigate to={redirectTo} />;
}

export default PrivateRoute