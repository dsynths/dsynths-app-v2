import { SynchronizerUpdater } from 'lib/synchronizer/instance'
import ApplicationUpdater from './application/updater'
import MulticallUpdater from './multicall/updater'
import PortfolioUpdater from './portfolio/updater'
import TransactionUpdater from './transactions/updater'
import UserUpdater from './user/updater'

export default function Updaters() {
  return (
    <>
      <SynchronizerUpdater />
      <ApplicationUpdater />
      <MulticallUpdater />
      <PortfolioUpdater />
      <TransactionUpdater />
      <UserUpdater />
    </>
  )
}
