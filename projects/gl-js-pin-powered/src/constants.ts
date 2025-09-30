/// <reference types="vite/client" />

import { v4 as uuid } from 'uuid'

export const ACCESS_TOKEN = import.meta.env
  .VITE_YOUR_MAPBOX_ACCESS_TOKEN as string
export const SESSION_ID = uuid()
