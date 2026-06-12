import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Home from "../pages/Home/Home";
import Deposit from "../pages/Deposit/Deposit";
import Withdraw from "../pages/Withdraw/Withdraw";
import Login from "../pages/Login/Login";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Profile from "../pages/Profile/Profile";
import CreateAdmin from "../pages/CreateAdmin/CreateAdmin";
import AllAffiliateUser from "../pages/AllAffiliateUser/AllAffiliateUser";
import SingleAffiliateDetails from "../pages/SingleAffiliateDetails/SingleAffiliateDetails";
import AllUser from "../pages/AllUser/AllUser";
import SingleUserDetails from "../pages/SingleUserDetails/SingleUserDetails";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute permKey="dashboard">
        <RootLayout />
      </PrivateRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute permKey="dashboard">
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <PrivateRoute permKey="profile">
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "create-admin",
        element: (
          <PrivateRoute permKey="create-admin">
            <CreateAdmin />
          </PrivateRoute>
        ),
      },
      {
        path: "all-affiliate-users",
        element: (
          <PrivateRoute permKey="all-affiliate-users">
            <AllAffiliateUser />
          </PrivateRoute>
        ),
      },
       {
        path: "single-affiliate-details/:id",
        element: (
          <PrivateRoute permKey="single-affiliate-details">
            <SingleAffiliateDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "all-users",
        element: (
          <PrivateRoute permKey="all-users">
            <AllUser />
          </PrivateRoute>
        ),
      },
      {
        path: "single-user-details/:id",
        element: (
          <PrivateRoute permKey="single-user-details">
            <SingleUserDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit",
        element: (
          <PrivateRoute permKey="deposit">
            <Deposit />
          </PrivateRoute>
        ),
      },

      {
        path: "withdraw",
        element: (
          <PrivateRoute permKey="withdraw">
            <Withdraw />
          </PrivateRoute>
        ),
      },
    ],
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
