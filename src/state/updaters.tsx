import ApplicationUpdater from './application/updater'
import ConductedUpdater from './conducted/updater'
import DetailsUpdater from './details/updater'
import MulticallUpdater from './multicall/updater'
import PortfolioUpdater from './portfolio/updater'
import QuotesUpdater from './quotes/updater'
import SignaturesUpdater from './signatures/updater'
import TransactionUpdater from './transactions/updater'
import UserUpdater from './user/updater'

export default function Updaters() {
  return (
    <>
      <ApplicationUpdater />
      <ConductedUpdater />
      <DetailsUpdater />
      <MulticallUpdater />
      <PortfolioUpdater />
      <QuotesUpdater />
      <SignaturesUpdater />
      <TransactionUpdater />
      <UserUpdater />
    </>
  )
}
