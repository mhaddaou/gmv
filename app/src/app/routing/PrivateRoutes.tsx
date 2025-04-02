import { FC, lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import TopBarProgress from 'react-topbar-progress-indicator'
import { getCSSVariableValue } from '../../_gmbbuilder/assets/ts/_utils'
import { WithChildren } from '../../_gmbbuilder/helpers'
import { MasterLayout } from '../../_gmbbuilder/layout/MasterLayout'
import { ConnectHubSpot } from '../../_gmbbuilder/partials/widgets/listings/ConnectHubSpotIntegration'
import { ConnectSalesForce } from '../../_gmbbuilder/partials/widgets/listings/ConnectSelesForceIntegration'
import { ListingsWrapperDetail } from '../pages/listings/ListingsDetails'
import { ListingsWrapper } from '../pages/listings/ListingsWrapper'

const PrivateRoutes = () => {
  const AccountPage = lazy(() => import('../modules/accounts/AccountPage'))
  const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Dashboard after success login/registartion */}
        <Route path='auth/*' element={<Navigate to='/listings' />} />
        {/* Pages */}
        <Route path='listings' element={<ListingsWrapper />} />
        <Route path='connect-hubspot' element={<ConnectHubSpot />} />
        <Route path='connect-salesforce' element={<ConnectSalesForce />} />
        <Route path="/listings/details/:id" element={<ListingsWrapperDetail />} />
        {/* Lazy Modules */}
        <Route
          path='/account/*'
          element={
            <SuspensedView>
              <AccountPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/user-management/*'
          element={
            <SuspensedView>
              <UsersPage />
            </SuspensedView>
          }
        />
        {/* Page Not Found */}
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({children}) => {
  const baseColor = getCSSVariableValue('--bs-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export { PrivateRoutes }

