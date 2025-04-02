
import { Content } from '../../../_gmbbuilder/layout/components/Content'
import ListingDetailsWidget from '../../../_gmbbuilder/partials/widgets/listings/ListingDetails'
// import SearchWidget from '../../../_gmbbuilder/partials/widgets/listings/SearchWidget'

const ListingsDetailsPage = () => (
  <>
    {/* <SearchWidget className='mb-5 mb-xl-0'  /> */}
    <Content>
      <ListingDetailsWidget />
    </Content>
  </>
)

const ListingsWrapperDetail = () => {
  // const intl = useIntl()
  return (
    <>
      {/* <PageTitle breadcrumbs={[]}>{intl.formatMessage({ id: 'MENU.DASHBOARD' })}</PageTitle> */}
      <ListingsDetailsPage />
    </>
  )
}

export { ListingsWrapperDetail }

