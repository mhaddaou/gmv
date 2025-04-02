
import React from 'react'
import {KTIcon, toAbsoluteUrl} from '../../../_gmbbuilder/helpers'
import {Link} from 'react-router-dom'
import {Dropdown1} from '../../../_gmbbuilder/partials'
import {useLocation} from 'react-router'
import { Toolbar } from '../../../_gmbbuilder/layout/components/toolbar/Toolbar'
import { Content } from '../../../_gmbbuilder/layout/components/Content'

const AccountHeader: React.FC = () => {
  const location = useLocation()

  return (
    <>
      <Toolbar />
      <Content>
        <div className='card mb-5 mb-xl-10'>
          <div className='card-body pt-0 pb-0'>
            <div className='d-flex overflow-auto h-55px'>
              <ul className='nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder flex-nowrap'>
                <li className='nav-item'>
                  <Link
                    className={
                      `nav-link text-active-info me-6 ` +
                      (location.pathname === '/account/settings' && 'active')
                    }
                    to='/account/settings'
                  >
                    My Account
                  </Link>
                </li>
                <li className='nav-item'>
                  <Link
                    className={
                      `nav-link text-active-info me-6 ` +
                      (location.pathname === '/account/integrations' && 'active')
                    }
                    to='/account/integrations'
                  >
                    Integrations
                  </Link>
                </li>
                <li className='nav-item'>
                  <Link
                    className={
                      `nav-link text-active-info me-6 ` +
                      (location.pathname === '/account/billing' && 'active')
                    }
                    to='/account/billing'
                  >
                    Billing
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Content>
    </>
  )
}

export {AccountHeader}
