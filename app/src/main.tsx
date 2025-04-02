import { createRoot } from 'react-dom/client'
// Axios
import axios from 'axios'
import { Chart, registerables } from 'chart.js'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import 'react-loading-skeleton/dist/skeleton.css'
// Apps
import './_gmbbuilder/assets/fonticon/fonticon.css'
import './_gmbbuilder/assets/keenicons/duotone/style.css'
import './_gmbbuilder/assets/keenicons/outline/style.css'
import './_gmbbuilder/assets/keenicons/solid/style.css'
import './_gmbbuilder/assets/sass/style.react.scss'
/**
 * TIP: Replace this style import with rtl styles to enable rtl mode
 *
 * import './_gmbbuilder/assets/css/style.rtl.css'
 **/
import { SkeletonTheme } from 'react-loading-skeleton'
import './_gmbbuilder/assets/sass/style.scss'
import { AuthProvider, setupAxios } from './app/modules/auth'
import { AppRoutes } from './app/routing/AppRoutes'
/**
 * Creates `axios-mock-adapter` instance for provided `axios` instance, add
 * basic Metronic mocks and returns it.
 *
 * @see https://github.com/ctimmerm/axios-mock-adapter
 */
/**
 * Inject Metronic interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */
setupAxios(axios)
Chart.register(...registerables)

const queryClient = new QueryClient()
const container = document.getElementById('root')
if (container) {
  createRoot(container).render(
    <SkeletonTheme baseColor="#E4E4E4FF" highlightColor="#DED2F8FF">
      <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SkeletonTheme>
  )
}
