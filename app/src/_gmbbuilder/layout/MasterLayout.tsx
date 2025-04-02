import { FC, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import {
  DrawerComponent,
  MenuComponent,
  ScrollComponent,
  ScrollTopComponent,
  SwapperComponent,
  ToggleComponent
} from '../assets/ts/components'
import { WithChildren } from '../helpers'
import { AsideDefault } from './components/aside/AsideDefault'
import { Footer } from './components/Footer'
import { HeaderWrapper } from './components/header/HeaderWrapper'
import { ScrollTop } from './components/ScrollTop'
import { PageDataProvider, useLayout } from './core'

const MasterLayout: FC<WithChildren> = ({children}) => {
  const {classes} = useLayout()
  const location = useLocation()

  useEffect(() => {
    setTimeout(() => {
        ToggleComponent.reinitialization();
        ScrollTopComponent.reinitialization();
        DrawerComponent.reinitialization();
        MenuComponent.reinitialization();
        ScrollComponent.reinitialization();
        SwapperComponent.reinitialization();
    }, 500)
  }, [location.key])

  return (
    <PageDataProvider>
      <div className='page d-flex flex-column flex-column-fluid'>
        <div className='wrapper d-flex flex-column flex-row-fluid' id='kt_wrapper'>
          <HeaderWrapper />
          <AsideDefault />
          <Outlet />
        </div>
        <Footer />
      </div>
      {/* end:: Modals */}
      <ScrollTop />
    </PageDataProvider>
  )
}

export { MasterLayout }

