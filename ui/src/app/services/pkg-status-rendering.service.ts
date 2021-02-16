import { PackageDataEntry, PackageMainStatus, PackageState, Status } from '../models/patch-db/data-model'
import { ConnectionState } from './connection.service'

export function renderPkgStatus (pkg: PackageDataEntry, connection: ConnectionState): PkgStatusRendering {
  if (!connection.network || !connection.internet) {
    return { display: 'Connecting', color: 'medium', showDots: true, feStatus: FEStatus.Connecting }
  }

  switch (pkg.state) {
    case PackageState.Installing: return { display: 'Installing', color: 'primary', showDots: true, feStatus: FEStatus.Installing }
    case PackageState.Updating: return { display: 'Updating', color: 'primary', showDots: true, feStatus: FEStatus.Updating }
    case PackageState.Removing: return { display: 'Removing', color: 'warning', showDots: true, feStatus: FEStatus.Removing }
    case PackageState.Installed: return handleInstalledState(pkg.installed.status)
  }
}

function handleInstalledState (status: Status): PkgStatusRendering {
  if (!status.configured) {
    return { display: 'Needs Config', color: 'warning', showDots: false, feStatus: FEStatus.NeedsConfig }
  }

  if (Object.values(status['dependency-errors']).length) {
    return { display: 'Dependency Issue', color: 'warning', showDots: false, feStatus: FEStatus.DependencyIssue }
  }

  switch (status.main.status) {
    case PackageMainStatus.Running: return { display: 'Running', color: 'success', showDots: false, feStatus: FEStatus.Running }
    case PackageMainStatus.Stopping: return { display: 'Stopping', color: 'dark', showDots: true, feStatus: FEStatus.Stopping }
    case PackageMainStatus.Stopped: return { display: 'Stopped', color: 'medium', showDots: false, feStatus: FEStatus.Stopped }
    case PackageMainStatus.BackingUp: return { display: 'Backing Up', color: 'warning', showDots: true, feStatus: FEStatus.BackingUp }
    case PackageMainStatus.Restoring: return { display: 'Restoring', color: 'primary', showDots: true, feStatus: FEStatus.Restoring }
  }
}

export interface PkgStatusRendering {
  feStatus: FEStatus
  display: string
  color: string
  showDots: boolean
}

// aggregate of all pkg statuses, except for Installed, which implies a "main" or "FE" status
export enum FEStatus {
  // pkg
  Installing = 'installing',
  Updating = 'updating',
  Removing = 'removing',
  // main
  Running = 'running',
  Stopping = 'stopping',
  Stopped = 'stopped',
  BackingUp = 'backing-up',
  Restoring = 'restoring',
  // FE
  Connecting = 'connecting',
  DependencyIssue = 'dependency-issue',
  NeedsConfig = 'needs-config',
}
