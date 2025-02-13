// frontend/src/App.jsx

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import SignupFormModal from './components/SignupPage/SignupFormModal';
import SpotDetails from './components/SpotDetails/SpotDetails';
import SplashPage from './components/SplashPage/SplashPage';
import NewSpot from './components/NewSpot/NewSpot';
import ManageSpots from './components/ManageSpots/ManageSpots';
import  Navigation  from './components/Navigation/Navigation';
import * as sessionActions from './store/session';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <SplashPage/>
      },
     
      {
        path: "/signup",
        element: <SignupFormModal />
      },
      {
        path: '/spots/:spotId',
        element:<SpotDetails/>
      },
      {
        path: '/spots/new',
        element: <NewSpot/>
      },
      {
        path:'/spots/current',
        element: <ManageSpots/>
      },
      {
        path:'/spots/:spotId/edit',
        element: <NewSpot/>
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
