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
import AddAffWithdrawMethod from "../pages/AddAffWithdrawMethod/AddAffWithdrawMethod";
import BulkAdjustment from "../pages/BulkAdjustment/BulkAdjustment";
import AffWithdrawRequests from "../pages/AffWithdrawRequests/AffWithdrawRequests";
import AffWithdrawRequestDetails from "../pages/AffWithdrawRequestDetails/AffWithdrawRequestDetails";

import AddDepositMethod from "../pages/AddDepositMethod/AddDepositMethod";
import AddDepositField from "../pages/AddDepositField/AddDepositField";
import AddDepositBonusTurnover from "../pages/AddDepositBonusTurnover/AddDepositBonusTurnover";
import ManualDeposit from "../pages/ManualDeposit/ManualDeposit";
import DepositRequests from "../pages/DepositRequests/DepositRequests";
import DepositRequestDetails from "../pages/DepositRequestDetails/DepositRequestDetails";
import AutoDepositSettings from "../pages/AutoDepositSettings/AutoDepositSettings";
import AutoDepositHistory from "../pages/AutoDepositHistory/AutoDepositHistory";
import AddWithdraw from "../pages/AddWithdraw/AddWithdraw";
import WithdrawRequest from "../pages/WithdrawRequest/WithdrawRequest";
import WithdrawRequestDetails from "../pages/WithdrawRequestDetails/WithdrawRequestDetails";
import GameCategory from "../pages/GameCategory/GameCategory";
import GameProvider from "../pages/GameProvider/GameProvider";
import Game from "../pages/Game/Game";
import Sport from "../pages/Sport/Sport";

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
        path: "add-aff-withdraw-method",
        element: (
          <PrivateRoute permKey="add-aff-withdraw-method">
            <AddAffWithdrawMethod />
          </PrivateRoute>
        ),
      },
      {
        path: "bulk-adjustment",
        element: (
          <PrivateRoute permKey="bulk-adjustment">
            <BulkAdjustment />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-withdraw-requests",
        element: (
          <PrivateRoute permKey="aff-withdraw-requests">
            <AffWithdrawRequests />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-withdraw-requests-details/:id",
        element: (
          <PrivateRoute permKey="aff-withdraw-requests-details">
            <AffWithdrawRequestDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "add-deposit-method",
        element: (
          <PrivateRoute permKey="add-deposit-method">
            <AddDepositMethod />
          </PrivateRoute>
        ),
      },
      {
        path: "add-deposit-field",
        element: (
          <PrivateRoute permKey="add-deposit-field">
            <AddDepositField />
          </PrivateRoute>
        ),
      },
      {
        path: "add-deposit-bonus-turnover",
        element: (
          <PrivateRoute permKey="add-deposit-bonus-turnover">
            <AddDepositBonusTurnover />
          </PrivateRoute>
        ),
      },
      {
        path: "manual-deposit",
        element: (
          <PrivateRoute permKey="manual-deposit">
            <ManualDeposit />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit-requests",
        element: (
          <PrivateRoute permKey="deposit-requests">
            <DepositRequests />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit-request-details/:id",
        element: (
          <PrivateRoute permKey="deposit-request-details">
            <DepositRequestDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "auto-deposit-settings",
        element: (
          <PrivateRoute permKey="auto-deposit-settings">
            <AutoDepositSettings />
          </PrivateRoute>
        ),
      },
      {
        path: "auto-deposit-history",
        element: (
          <PrivateRoute permKey="auto-deposit-history">
            <AutoDepositHistory />
          </PrivateRoute>
        ),
      },
      {
        path: "add-withdraw",
        element: (
          <PrivateRoute permKey="add-withdraw">
            <AddWithdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "withdraw-requests",
        element: (
          <PrivateRoute permKey="withdraw-requests">
            <WithdrawRequest />
          </PrivateRoute>
        ),
      },
      {
        path: "withdraw-request-details/:id",
        element: (
          <PrivateRoute permKey="withdraw-requests">
            <WithdrawRequestDetails />
          </PrivateRoute>
        ),
      },

      {
        path: "add-category",
        element: (
          <PrivateRoute permKey="add-category">
            <GameCategory />
          </PrivateRoute>
        ),
      },
      {
        path: "add-provider",
        element: (
          <PrivateRoute permKey="add-provider">
            <GameProvider />
          </PrivateRoute>
        ),
      },
      {
        path: "add-game",
        element: (
          <PrivateRoute permKey="add-game">
            <Game />
          </PrivateRoute>
        ),
      },
      {
        path: "add-sport-game",
        element: (
          <PrivateRoute permKey="add-sport-game">
            <Sport />
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
