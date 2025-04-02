import React from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../_gmbbuilder/layout/core'
import { AccountHeader } from './AccountHeader'
import { Integrations } from './components/settings/Integrations'
import { NotificationsPage } from './components/settings/Notifications'
import { Settings } from './components/settings/Settings'
import { Billing } from './components/settings/Billing'

const accountBreadCrumbs: Array<PageLink> = [
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const AccountPage: React.FC = () => {
  return (
    <Routes>
      <Route
        element={
          <>
            <AccountHeader />
            <Outlet />
          </>
        }
      >
        <Route
          path='settings'
          element={
            <>
              <PageTitle breadcrumbs={accountBreadCrumbs}>Settings</PageTitle>
              <Settings />
            </>
          }
        />
        <Route
          path='integrations'
          element={
            <>
              <PageTitle breadcrumbs={accountBreadCrumbs}>Integrations</PageTitle>
              <Integrations />
            </>
          }
        />
        <Route
          path='billing'
          element={
            <>
              <PageTitle breadcrumbs={accountBreadCrumbs}>Billing</PageTitle>
              <Billing />
            </>
          }
        />
        <Route
          path='notifications'
          element={
            <>
              <PageTitle breadcrumbs={accountBreadCrumbs}>Settings</PageTitle>
              <NotificationsPage />
            </>
          }
        />
        <Route index element={<Navigate to='/account/overview' />} />
      </Route>
    </Routes>
  )
}

export default AccountPage
