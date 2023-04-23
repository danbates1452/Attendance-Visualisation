import React from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import './App.css';
import {Chart as ChartJS} from 'chart.js/auto'; //must import for charts to render

import Root from './routes/root';
import ErrorPage from './routes/error-page';
import HomePage from './routes/home-page';
import FiltersPage from './routes/filters-page';
import UsersPage from './routes/users-page';
import DataPage from './routes/data-page';
import LoginPage from './routes/login-page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>,
    errorElement: <ErrorPage/>,
    children: [
      {
        path: '/home',
        element: <HomePage/>
      },
      {
        path: '/filters',
        element: <FiltersPage/>
      },
      {
        path: '/users',
        element: <UsersPage/>
      },
      {
        path: '/data',
        element: <DataPage/>
      },
      {
        path: '/login',
        element: <LoginPage/>
      }
    ]
  }
]);

function App() {
  return (
    <div className='App'>
      <RouterProvider router={router}/>
    </div>
  );

}

export default App;
